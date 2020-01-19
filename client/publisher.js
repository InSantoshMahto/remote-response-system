var mqtt = require("mqtt");
let options = {
  protocol: "mqtt",
  host: "192.168.43.111",
  port: 1885,
  username: "myUserName",
  password: "myPass",
  clientId: "publisher"
};
let client = mqtt.connect(options);
client.on("connect", function() {
  console.log(`connected to MQTT server on port: ${options.port}`);

   client.publish(
      "myUserName/status",
      "connected",
      {
        qos: 0,
        retain: false,
        dup: false
      },
      err => {
        console.log(`TOPIC: for nodemcu is published: connected`);
        if (err) {
          console.log("Error occurs");
        }
      }
    );
});
