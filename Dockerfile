FROM node:20.6.0

RUN mkdir /bestyol-back
WORKDIR /bestyol-back

COPY . .
RUN npm install
RUN npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]