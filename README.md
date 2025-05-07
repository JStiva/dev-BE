### Install packages

npm install

### Generate the Prisma Client:

npx prisma generate

### Build your docker images

docker compose build

### Create PostgreSQL migrations and apply

docker compose run app npx prisma migrate dev --name init

### Boot containers

docker compose up

### Stop docker

docker compose down
