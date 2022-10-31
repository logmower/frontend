FROM node AS dev

WORKDIR /app
EXPOSE 8080

COPY package* ./
RUN npm install
COPY . .

ENTRYPOINT ["npm", "run", "dev"]

# builder
FROM dev AS builder
RUN npm run build

# serve
FROM nginx AS prod
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist .
ENTRYPOINT ["nginx", "-g", "daemon off;"]