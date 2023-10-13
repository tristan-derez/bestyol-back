FROM node:20.6.0

WORKDIR /bestyol-back

COPY . .
# install node modules
RUN npm install
# generate prisma client
RUN npx prisma generate
# build for production
RUN npm run build

# copy and run entrypoint
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ["/bestyol-back/entrypoint.sh"]