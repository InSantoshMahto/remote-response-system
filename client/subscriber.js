let mqtt = require('mqtt');
let options = {
    protocol: 'mqtt',
    host: '192.168.43.111',
    port: 1885,
    username: 'myUserName',
    password: 'myPass',
    clientId: 'subscriber'
};
let client = mqtt.connect(options);

client.on('connect', function () {
    console.log(`connected to MQTT server on port: ${options.port}`);
    client.subscribe("myUserName/ans", {
        qos: 0
    }, () => {
        // TODO:
        console.log("msg publish");
    });
});

client.on('message', function (topic, message) {
    context = message.toString();
    console.log(`Topic: ${topic} \t msg: ${context}`)
});