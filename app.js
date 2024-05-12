import { MongoClient } from 'mongodb';
import routes from './routes.js';

const dbClient = new MongoClient('mongodb://localhost:27017');

async function main() {
    await dbClient.connect();
    console.log('connected to Mongo succesfully!');
    const db = dbClient.db('spotify');
    const app = routes(db);
    app.listen(80);
    //inizio codice
}

main().finally(() => dbClient.close());