FROM node:20.6.0

RUN mkdir /bestyol-back
WORKDIR /bestyol-back

COPY . .
# install node modules
RUN npm install
# generate prisma client
RUN npx prisma generate
# build for production
RUN npm run build

# copy and run entrypoint
COPY entrypoint.sh /bestyol-back/entrypoint.sh
RUN chmod +x /bestyol-back/entrypoint.sh

CMD ["/bestyol-back/entrypoint.sh"]