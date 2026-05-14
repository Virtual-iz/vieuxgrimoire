FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

RUN npm install -g serve

CMD serve -s build -l ${PORT:-3000}
