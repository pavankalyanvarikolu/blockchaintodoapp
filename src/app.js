const App = {
  contracts: {},
  loading: false,

  load: async () => {
      await App.loadWeb3();
      console.log("App is loading...");
      await App.loadAccount();
      await App.loadContract();
      await App.render();
  },

  loadWeb3: async () => {
      if (window.ethereum) {
          App.web3Provider = window.ethereum;
          window.web3 = new Web3(App.web3Provider);
          try {
              await ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error) {
              console.error("User denied account access", error);
              alert("You need to allow MetaMask access for this DApp to function properly.");
          }
      } else if (window.web3) {
          App.web3Provider = window.web3.currentProvider;
          window.web3 = new Web3(App.web3Provider);
      } else {
          alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
  },

  loadAccount: async () => {
      try {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length === 0) {
              console.error("No accounts found");
              alert("No accounts found. Make sure your MetaMask is connected.");
          } else {
              App.account = accounts[0];
              console.log("Account loaded:", App.account);
              $('#account').text(`Connected Account: ${App.account}`);
              $('#connectWalletButton')
                  .text('Connected')
                  .attr('disabled', true)
                  .removeClass('btn-primary')
                  .addClass('btn-success'); // Change button color to green
          }
      } catch (error) {
          console.error("Error loading account", error);
      }
  },

  loadContract: async () => {
    try {
        const todoList = await $.getJSON('ToDoList.json');
        console.log("Contract JSON loaded:", todoList); // Debugging line
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);

        App.todoList = await App.contracts.TodoList.deployed();
        console.log("Contract loaded:", App.todoList); // Debugging line
    } catch (error) {
        console.error("Error loading contract", error);
        alert("Error loading smart contract. Please check the console for details.");
    }
},


  render: async () => {
      if (App.loading) return;

      App.setLoading(true);
      await App.renderTasks();
      App.setLoading(false);
  },

  renderTasks: async () => {
      try {
          const taskCount = await App.todoList.taskCount();
          const $taskTemplate = $('<li class="taskTemplate"><input type="checkbox" /><span class="content"></span></li>');

          for (let i = 1; i <= taskCount; i++) {
              const task = await App.todoList.tasks(i);
              const taskId = task[0].toNumber();
              const taskContent = task[1];
              const taskCompleted = task[2];

              const $newTaskTemplate = $taskTemplate.clone();
              $newTaskTemplate.find('.content').html(taskContent);
              $newTaskTemplate.find('input')
                              .prop('name', taskId)
                              .prop('checked', taskCompleted)
                              .on('click', App.toggleCompleted);

              if (taskCompleted) {
                  $('#completedTaskList').append($newTaskTemplate);
              } else {
                  $('#taskList').append($newTaskTemplate);
              }

              $newTaskTemplate.show();
          }
      } catch (error) {
          console.error("Error rendering tasks", error);
      }
  },

  createTask: async () => {
      try {
          App.setLoading(true);
          const content = $('#newTask').val();
          if (content.trim() === "") {
              alert("Task content cannot be empty.");
              App.setLoading(false);
              return;
          }

          // Interact with the contract
          await App.todoList.createTask(content, { from: App.account });

          // Confirmation feedback
          alert("Task successfully added!");

          // Once the transaction is successful, render the tasks again
          await App.renderTasks();
          $('#newTask').val('');  // Clear the input field
      } catch (error) {
          console.error("Error creating task", error);
          alert(`There was an error while creating the task. Please try again. Details: ${error.message}`);
      } finally {
          App.setLoading(false);
      }
  },

  toggleCompleted: async (e) => {
      try {
          App.setLoading(true);
          const taskId = e.target.name;
          await App.todoList.toggleCompleted(taskId, { from: App.account });
          window.location.reload();
      } catch (error) {
          console.error("Error toggling task completion", error);
          App.setLoading(false);
      }
  },

  setLoading: (isLoading) => {
      App.loading = isLoading;
      const loader = $('#loader');
      const content = $('#content');
      if (isLoading) {
          $('#addTaskButton').attr('disabled', true);  // Disable the form submit button
          loader.show();
          content.hide();
      } else {
          $('#addTaskButton').attr('disabled', false);  // Enable the form submit button
          loader.hide();
          content.show();
      }
  }
};

$(() => {
  $(window).on('load', () => {
      App.load();

      $('#taskForm').submit((event) => {
          event.preventDefault();
          App.createTask();  // This triggers MetaMask and adds the task
      });

      $('#connectWalletButton').click(() => {
          App.loadWeb3();
      });
  });
});
