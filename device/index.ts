import * as Camera from 'camerapi';
import * as oxford from 'project-oxford';
import * as fs from 'fs';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';

let cogClient = new oxford.Client('d7889254b9244ec1ba54e8cf154ff359');
let connectionString = 'HostName=iot-workshop-hub.azure-devices.net;DeviceId=device1;SharedAccessKey=zyislRKCFj5k916xvNRyB0JPihQpad/56tzTMZMWpdk=';
let hubClient = deviceAmqp.clientFromConnectionString(connectionString);

hubClient.open(err => {
    if (err) console.log(err)
    else {
        let cam = new Camera();
        cam.baseFolder('.');
        cam.takePicture('picture.png', (file, error) => {
            if (error) console.log(error);
            cogClient.vision.analyzeImage({ path: 'picture.png', Tags: true })
                .then(result => {
                    fs.unlinkSync('picture.png'); //delete the picture
                    
                    let message = new device.Message(JSON.stringify({ deviceId: 'device1', tags: result.tags }));
                    hubClient.sendEvent(message, (err, res) => {
                        if (err) console.log(err);
                        else console.log(`Sent ${JSON.stringify(result.tags)} to your IoT Hub`);
                        hubClient.close((err, res) => {
                            if (err) console.log(err);
                        })
                    });
                });
        });
    }
})