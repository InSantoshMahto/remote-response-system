'use strict'
const express = require('express');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const logger = require('morgan');
const http = require('http');
const path = require('path');
const mosca = require("mosca");

const app = express();
const httpServer = http.createServer(app);
const URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'iot_dev';
const COLLECTION_NAME = 'test';
const PORT = process.env.PORT || 80;

/**
 * config for MQTT Broker
 */
// var SECURE_KEY = __dirname + '/ssl/cert.pem';
// var SECURE_CERT = __dirname + '/ssl/key.pem';

let ascoltatore = {
    //using ascoltatore
    type: "mongo",
    url: "mongodb://localhost:27017/mqtt",
    pubsubCollection: "ascoltatori",
    mongo: {}
};

let settings = {
    /**
     * default port is 1883 and 8883 for ssl.
     * i am using port 1883 because mosquito server is running on default port.
     */
    port: 1885,
    backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.Mongo,
        url: "mongodb://localhost:27017/mqtt"
    },
    // secure: {
    //     port: 8888,
    //     keyPath: SECURE_KEY,
    //     certPath: SECURE_CERT,
    // }
};

let mqttServer = new mosca.Server(settings); // mqttServer i.e, MQTT BROCKER SERVER
mqttServer.attachHttpServer(httpServer);

/**
 * only for MQTT brocker server
 */
mqttServer.on("ready", () => {
    console.log(`Mosca Server Listening on Port ${settings.port}`);
    mqttServer.authenticate = authenticate;
    mqttServer.authorizePublish = authorizePublish;
    mqttServer.authorizeSubscribe = authorizeSubscribe;
});

/**
 * only for http server
 */
// app.listen(PORT);
httpServer.listen(PORT);
console.log(`Http Server Listening on Port ${PORT}`);


/**
 * view config
 */
const INDEX = './index';

/**
 * mMddleware
 */

// Logger with morgan module
app.use(logger('combined'));

// Enable call cors request
app.use(cors());

// config for view
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

//MIME Type 
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

/**
 * Routeing 
 */

app.get('/', (req, res) => {
    MongoClient.connect(URL, {
        userNewUrlParser: true
    }, (err, client) => {
        if (err) throw err;
        const db = client.db(DB_NAME);
        db.collection(COLLECTION_NAME).find({}).toArray((err, results) => {
            if (err) throw err;
            console.log('results', results);
            client.close();
            res.set({
                'Content-Type': 'text/html'
            });
            res.status(200);
            res.render(INDEX, {
                results: results
            });
        });

    })
});

app.get('/insert', (req, res) => {
    let name = req.query.name;
    console.log(name);
    // db task
    MongoClient.connect(URL, {
        useNewUrlParser: true
    }, (err, client) => {
        if (err) throw err;
        console.log('Connected to the server');
        const db = client.db(DB_NAME);
        console.log('database selected');
        db.collection(COLLECTION_NAME).insertOne({
            name: name
        }, (err, results) => {
            if (err) throw err;
            console.log(results);
            client.close();
            console.log('DisConnected to the server');
            res.send({
                status: 'success',
                name: name
            })
        })
    })
})

app.get('/fetch', (req, res) => {
    // TODO:
    fetchData('all', (err, results) => {
        if (err) throw err;
        res.set({
            'Content-Type': 'text/html'
        });
        res.status(200).send(results);
    })
})

/**
 * supporting sunction area
 */

// fetch data from database
let fetchData = (data, callback) => {
    console.log(data);
    MongoClient.connect(URL, {
        userNewUrlParser: true
    }, (err, client) => {
        if (err) throw err;
        const db = client.db(DB_NAME);
        db.collection(COLLECTION_NAME).find({}).toArray((err, results) => {
            if (err) throw err;
            console.log('results', results);
            client.close();

            return callback(false, results);
        });
    })
}




/**
 * MQTT brocker server
 */
// Sending data from mosca to clients
let packet = {
    topic: "myUserName/status",
    payload: "your are connected.", // or a Buffer
    qos: 0, // 0, 1, or 2
    retain: false, // or true,
    dup: true
};

mqttServer.on("clientConnected", function (client) {
    console.log("client connected", client.id);
    setTimeout(()=>{
        mqttServer.publish(packet, null, () => {
            console.log("published");
        })
    }, 5000);
});

// fired when a message is received
mqttServer.on("published", function (packet, client) {
    // console.log('Published', packet.payload);
});

// Accepts the connection if the username and password are valid
let authenticate = function (client, username, password, callback) {
    console.log(
        `\nAuthenticated user: \nclient: ${client.id}\nusername: ${username}\npassword: ${password}`
    );
    let authorized =
        username === "myUserName" && password.toString() === "myPass";
    if (authorized) client.user = username;
    callback(null, authorized);
};

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
let authorizePublish = function (client, topic, payload, callback) {
    console.log(`authorizePublisher ${topic} : ${client.id}`);
    callback(null, client.user == topic.split("/")[0]);
};

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
let authorizeSubscribe = function (client, topic, callback) {
    console.log(`authorizeSubscriber ${topic} : ${client.id}`);
    callback(null, client.user == topic.split("/")[0]);
};