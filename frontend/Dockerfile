# Use Node.js 
FROM node:18 

# Set working directory 
WORKDIR /app 

# Copy package files 
COPY package*.json ./ 

# Install dependencies 
RUN npm install 

# Copy all files 
COPY . . 

# Expose port 
EXPOSE 3000 

# Start React app 
CMD ["npm", "start"] 
