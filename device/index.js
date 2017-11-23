run();

async function run() {
    log('establishing connection to gpio...');
    let five = await readyBoard();
    let led = new five.Led('GPIO26');
    let button = new five.Button('GPIO20');

    log('connecting to iot hub...');
    let hubClient = await connectToIoTHub();

    led.stop().off();
    log('READY');

    button.on('press', async () => {
        led.blink(500);

        log('taking a picture...');
        await takePicture('picture.png');

        log(`analyzing image...`);
        let tags = await analyzeImage('picture.png');

        await deleteImage('picture.png');

        log('sending message to iot hub...');
        await sendMessage(hubClient, JSON.stringify(tags));
        log(`Sent ${JSON.stringify(tags)} to your IoT Hub`);

        led.stop().off();
        log('READY');
    })
}

function readyBoard() {
    return new Promise((resolve, reject) => {
        let five = require('johnny-five');
        let raspi = require('raspi-io');

        let board = new five.Board({ io: new raspi() });
        board.on('ready', () => {
            resolve(five);
        });
    });
}

function connectToIoTHub() {
    return new Promise((resolve, reject) => {
        let deviceAmqp = require('azure-iot-device-amqp');
        let connectionString = process.env.DEVICE_CONN_STRING;
        let client = deviceAmqp.clientFromConnectionString(connectionString);

        client.open(err => {
            if (err) reject(err);
            resolve(client);
        });
    })
}

function takePicture() {
    return new Promise((resolve, reject) => {
        let Camera = require('camerapi');

        let cam = new Camera();
        cam.baseFolder('.');
        cam.takePicture('picture.png', (file, error) => {
            if (error) reject(error);
            resolve(file);
        });
    });
}

function analyzeImage(image) {
    let oxford = require('project-oxford');
    let cogClient = new oxford.Client(process.env.COGNITIVE_SERVICES_KEY);
    return cogClient.vision.analyzeImage({ path: image, Tags: true })
        .then(result => result.tags);
}

function deleteImage(image) {
    return new Promise((resolve, reject) => {
        let fs = require('fs');
        fs.unlink(image, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

function sendMessage(client, content) {
    return new Promise((resolve, reject) => {
        let device = require('azure-iot-device');
        let message = new device.Message(content);
        client.sendEvent(message, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });

    });
}

function log(msg) {
    console.log(msg);
}