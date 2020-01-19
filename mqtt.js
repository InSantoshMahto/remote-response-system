'use strict'
const mosca = require("mosca");

const URL = 'mongodb://localhost:27017/mqtt';
/**
 * default port is 1883 and 8883 for ssl.
 * i am using port 1883 because mosquito server is running on default port.
 */
const PORT = 1883;
const PORT_SSL = 8883;

/**
 * config for MQTT Broker
 */
// var SECURE_KEY = __dirname + '/ssl/cert.pem';
// var SECURE_CERT = __dirname + '/ssl/key.pem';

let ascoltatore = {
    //using ascoltatore
    type: "mongo",
    url: URL,
    pubsubCollection: "ascoltatori",
    mongo: {}
};

let settings = {
    port: PORT,
    backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.Mongo,
        url: URL
    },
    // secure: {
    //     port: PORT_SSL,
    //     keyPath: SECURE_KEY,
    //     certPath: SECURE_CERT,
    // }
};

let mqttServer = new mosca.Server(settings); // mqttServer i.e, MQTT BROCKER SERVER

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
    setTimeout(() => {
        mqttServer.publish(packet, client, () => {
            console.log("published");
        })
    }, 5000);
});

// fired when a message is received
mqttServer.on("published", function (packet, client) {
    // console.log('Published', packet.payload);
});

// Accepts the connection if the username and password are valid and client is register with unique client id.
let authenticate = function (client, username, password, callback) {
    console.log(
        `\nAuthenticated user: \nclient: ${client.id}\nusername: ${username}\npassword: ${password}`
    );

    // TODO: authenticate client using username and password. also assign client unique client id.

    let authorized = username === "myUserName" && password.toString() === "myPass";
    
    if (authorized) client.user = username;
    callback(null, authorized);
};

// authorized publisher using username
let authorizePublish = function (client, topic, payload, callback) {
    console.log(`authorizePublisher ${topic} : ${client.id}`);
    //  TODO: authorize publisher.
    callback(null, client.user == topic.split("/")[0]);
};

// authorized subscriber using username
let authorizeSubscribe = function (client, topic, callback) {
    console.log(`authorizeSubscriber ${topic} : ${client.id}`);
    //  TODO: authorize subscriber.
    callback(null, client.user == topic.split("/")[0]);
};