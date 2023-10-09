# delay here is needed for docker
sleep 10;

npx prisma db push;
node dist/prisma/seed.js;

echo "Starting your Node.js application...";
exec npm start;