FROM node:alpine

WORKDIR /usr/src/app

# do the npm install
COPY package*.json ./
RUN npm install

# copy our source code into the image
COPY . .

# pm2 run command
CMD ["npm", "start"]