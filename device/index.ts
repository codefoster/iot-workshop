import * as Camera from 'camerapi';
import * as oxford from 'project-oxford';
import * as fs from 'fs';
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';

let cogClient = new oxford.Client('d7889254b9244ec1ba54e8cf154ff359');
var connectionString = 'HostName=cfhub.azure-devices.net;DeviceId=<deviceid>;SharedAccessKey=0ZDUbn/1hTIgKtl4sfLYD+peW63aNnQgQhkVCi99i88=';
var hubClient = deviceAmqp.clientFromConnectionString(connectionString);

let cam = new Camera();
cam.baseFolder('.');
cam.takePicture('picture.png',(file,error) => {
    cogClient.vision.analyzeImage({ path: 'picture.png', Tags: true }).then(result => {
        let tags = result.tags.filter(t => t.confidence >= .5).map(t => t.name);
        console.log(JSON.stringify(tags, undefined, 4));
        fs.unlinkSync('picture.png'); //delete the picture

        var message = new device.Message(JSON.stringify({ deviceId: '<deviceid>', tags: tags }));
        hubClient.sendEvent(message);

    });
});