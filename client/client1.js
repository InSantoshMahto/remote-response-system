let mqtt = require('mqtt')
let options = {
    protocol: 'mqtt',
    host: '192.168.1.4',
    port: 1885,
    username: 'myUserName',
    password: 'myPass',
    clientId: 'client1'
};
let client = mqtt.connect(options);

client.on('connect', function () {
    console.log("connected to MQTT server");

    // client.subscribe('ping/myUserName', function (err, info) {
    //     info = JSON.stringify(info);
    //     console.log(`subscribe to ping TOPIC with these info: ${info}`);

    //     if (err) {
    //         console.log('Error occurs');
    //     }
    // })
    setTimeout(()=>{
        client.publish("myUserName/question", "agfdklagKSLKHFG",(err)=>{
            console.log("question started");
            if (err) throw err;
        })
    }, 3000)
})
client.on('message', (topic, message, packet) => {
    message = message.toString();
    console.log(`Topic: ${topic}\nMessage: ${message}\nPacket: ${JSON.stringify(packet)}`);
})