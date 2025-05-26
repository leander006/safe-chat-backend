# Use a Node.js image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the TypeScript code
RUN npm run build
RUN npm run migrate
# Expose the application port
EXPOSE 3001

# Command to start the application
CMD ["npm","run", "start"]
