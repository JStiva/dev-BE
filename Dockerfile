FROM node:23-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5003 

# Define the command to run app
CMD ["node", "./src/server.js"]