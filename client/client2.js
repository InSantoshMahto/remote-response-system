var mqtt = require('mqtt')
let options = {
    protocol: 'mqtt',
    host: '192.168.1.4',
    port: 1885,
    username: 'myUserName',
    password: 'myPass',
    clientId: 'client2'
};
let client = mqtt.connect(options);

client.on('connect', function () {
    console.log("connected to MQTT server");

    // setInterval(() => {
    //     client.publish('myUserName/session', "start", (err) => {
    //         console.log('TOPIC: session is published.');

    //         if (err) {
    //             console.log('Error occurs');
    //         }
    //     })
    // }, 2500);
    setTimeout(() => {
        client.publish('myUserName/session', "started", (err) => {
            console.log('TOPIC: session is published. started');

            if (err) {
                console.log('Error occurs');
            }
        })
    }, 5000);
});