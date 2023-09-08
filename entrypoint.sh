npx prisma db push
npx prisma generate
node ./dist/prisma/seed.js

exec node ./dist/server.js