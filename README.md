# Abingdon Publishing Widget

![Screenshot on Firefly](https://github.com/EchoEkhi/abingdon-publishing/blob/master/Firefly_Screenshot.jpg?raw=true)

A widget to be put onto the side of Firefly Learning Platform. Provides descriptions and links to article PDFs to potentially interested readers.

## Setup and Install

Setup dev environment
- Rename `abs_pub.example.db` to `abs_pub.dev.db` and use SQLite Studio to inspect and modify rows
- Edit server/.env_example and follow instructions within
- Install dependencies
- `cd client && npm i`
- `cd server && npm i`
- `cd server && cp .env_example .env && npx prisma generate`
- `cd server && npx nodemon`
- `cd client && npm run dev`

Build for production
- Install dependancies
- `cd client && npm i`
- `cd server && npm i`
- `cd client && npm run build`
- `mv client/dist/* server/public/ -r`
- `cd server && npx prisma generate`
- Upload your own version of `abs_pub.prod.db` with predefined users. Don't forget to back up when overwriting files!
