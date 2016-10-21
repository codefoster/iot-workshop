import * as oxford from 'project-oxford';
import * as Camera from 'camerapi';
import * as fs from 'fs';

let clientFromConnectionString = require('azure-iot-device-amqp').clientFromConnectionString;
let Message = require('azure-iot-device').Message;

let client = new oxford.Client('d7889254b9244ec1ba54e8cf154ff359');

let cam = new Camera();
cam.baseFolder('.');
cam.takePicture('picture.png',(file,error) => {
    client.vision.analyzeImage({ path: 'picture.png', Tags: true }).then(result => {
        let tags = result.tags.filter(t => t.confidence >= .5).map(t => t.name);
        console.log(JSON.stringify(tags, undefined, 4));
        fs.unlinkSync('picture.png'); //delete the picture
    });
});