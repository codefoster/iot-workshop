import * as five from 'johnny-five';
import * as raspi from 'raspi-io';
import * as Camera from 'camerapi';
import * as oxford from 'project-oxford';
import * as fs from 'fs';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';

let cogClient = new oxford.Client('d7889254b9244ec1ba54e8cf154ff359');
let connectionString = 'HostName=iot-workshop-hub.azure-devices.net;DeviceId=device1;SharedAccessKey=zyislRKCFj5k916xvNRyB0JPihQpad/56tzTMZMWpdk=';
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
                                let message = new device.Message(JSON.stringify({ deviceId: 'device1', tags: ['foo', 'baz', 'bar'] }));
                                hubClient.sendEvent(message, (err, res) => {
                                    if (err) log(err.message);
                                    else {
                                        log(`Sent ${JSON.stringify(result.tags)} to your IoT Hub`);
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


function log(msg: string) {
    console.log(msg);
}