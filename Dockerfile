# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Truffle globally
RUN npm install -g truffle

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of your application's source code
COPY . .

# Compile your Solidity contracts
RUN truffle compile

# Expose the port the app runs on
EXPOSE 3000

# Command to run your app (modify accordingly if you use a different command)
CMD ["npm", "run", "dev"]
