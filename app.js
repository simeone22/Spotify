import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const dbClient = new MongoClient('mongodb://localhost:27017');

async function main() {
    await dbClient.connect();
    console.log('connected to Mongo succesfully!');
    const db = client.db('spotify');
    app.listen(80);
    //inizio codice
}

main().finally(() => dbClient.close());