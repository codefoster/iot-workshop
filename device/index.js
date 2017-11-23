let five = require('johnny-five');
let raspi = require('raspi-io');
let Camera = require('camerapi');
let oxford = require('project-oxford');
let fs = require('fs');
let device = require('azure-iot-device');
let deviceAmqp = require('azure-iot-device-amqp');

let cogClient = new oxford.Client(process.env.COGNITIVE_SERVICES_KEY);
let connectionString = process.env.DEVICE_CONN_STRING;
let hubClient = deviceAmqp.clientFromConnectionString(connectionString);

//establishing connection to gpio
log('establishing connection to gpio...');
let board = new five.Board({ io: new raspi() });
board.on('ready', () => {
    let led = new five.Led('GPIO26');
    let button = new five.Button('GPIO20');
    led.stop().off();

    //open connection to iot hub
    log('connecting to iot hub...');
    hubClient.open(err => {
        if (err)
            log(err.message)
        else {
            log('READY');
            led.stop().off();

            let cam = new Camera();
            cam.baseFolder('.');
            button.on('press', () => {
                led.blink(500);
                log('taking a picture...');
                cam.takePicture('picture.png', (file, error) => {
                    if (error) log(error);
                    else {
                        //analyzing image
                        log('analyzing image...');
                        cogClient.vision.analyzeImage({ path: 'picture.png', Tags: true })
                            .then(result => {
                                fs.unlinkSync('picture.png'); //delete the picture

                                //sending message to iot hub
                                log('sending message to iot hub...');
                                let tags = JSON.stringify(result.tags);
                                let message = new device.Message(tags);
                                hubClient.sendEvent(message, (err, res) => {
                                    if (err) log(err.message);
                                    else {
                                        log(`Sent ${tags} to your IoT Hub`);
                                        log('READY');
                                    }
                                    led.stop().off();
                                });
                            })
                            .catch(err => {
                                log('error analyzing image... ' + err.message);
                                led.stop().off();
                            });
                    }
                });
            })
        }
    })
})

function log(msg) {
    console.log(msg);
}