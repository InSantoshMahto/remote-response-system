var mqtt = require('mqtt');
let options = {
    protocol: 'mqtt',
    host: '192.168.0.91',
    port: 1884,
    username: 'myUserName',
    password: 'myPass',
    clientId: 'index'
};
let client = mqtt.connect(options);

client.on('connect', function () {
    console.log("connected to MQTT server");
    client.subscribe('ping', function (err, info) {
        console.log(`subscribe to TOPIC: \'ping\' with these info: ${JSON.stringify(info)}`);
        if (!err) {
            client.publish('presence', 'Hello mqtt')
        }
    })
    client.subscribe('myTopic', function (err, info) {
        console.log(`subscribe to TOPIC: \'myTopic\' with these info: ${JSON.stringify(info)}`);
        if (!err) {
            client.publish('presence', 'Hello mqtt')
        }
    })
})

client.on('message', function (topic, message) {
    console.log('received a info form message Event');
    // message is Buffer
    console.log(topic, ":", message.toString())
})