const {MongoClient, ServerApiVersion} = require('mongodb');

const uri = "mongodb://127.0.0.1:27017";    // MongoDB connection URI
const dbName = "VentilationSystemData";     // Database name

// Create a new instance of the MongoClient
const mongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

function connectToDatabase() {
    try {
        // Connect the mongoClient to the server
        mongoClient.connect().then(() => console.log("Connected to the database successfully!"));

        const db = mongoClient.db(dbName);

        // Specify and return the collection
        return db.collection('SensorData');
    } catch (error) {
        console.log("Error connecting to the database");
    }
}

const collection = connectToDatabase();

// Store data in MongoDB
function store(data){
    collection.insertOne(data)
        .then(() => console.log('Data inserted successfully!'))
        .catch((error) => console.error('Error inserting data:', error));
}

// Export the functions and the collection object
module.exports = {
    collection,
    store,
};