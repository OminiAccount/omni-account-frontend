FROM nginx:alpine

RUN apk add --update nodejs npm

RUN mkdir /app
WORKDIR /app

COPY . .

RUN mv ./omni-account-sdk /
RUN cd /omni-account-sdk && npm install
RUN cd /app && npm install

EXPOSE 3000

CMD ["sh", "-c", "npm start"]

