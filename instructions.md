# Instructions

## Overview
{ purpose, strategy, reasons, etc. }

## Taking inventory
* Raspberry Pi
* Raspberry Pi camera module
* SD card
* Network cable
* Power cable

{ a bit of description on each }

## Installing Raspbian
{ could just link to other instructions instead of including here }

## Installing Node
{ mention how many different ways there are to install Node }
{ then give my favorite method }

```
wget http://nodejs.org/dist/v6.9.1/node-v6.9.1-linux-armv7l.tar.xz
tar -xf node-v6.9.1-linux-armv7l.tar.xz
sudo mv node-v6.9.1-linux-armv7l /usr/local/node/v6.9.1
cd /usr/local/bin
sudo ln -s /usr/local/node/v6.9.1/bin/node node
sudo ln -s /usr/local/node/v6.9.1/bin/npm npm
node -v
npm -v
```
## Getting set up with Cognitive Services
{ put directions here for using cog svcs and getting a key }
Go to [the Cognitive Services page](http://microsoft.com/cognitive) and get your own API key 

## Creating our IoT Hub
{ show steps to create an iot hub (or just provide a link) }

## Writing the Device Code
{ talk about using typescript }
{ talk about creating the package.json, tsconfig.json, and index.ts }

### Taking a Picture
If you're on the command line of the Raspberry Pi, you use the `raspicam` utility to take a photo or video. If you're writing an application in Node.js, however, you use a module to wrap that call to `raspicam`. The module I chose is called [`camerapi`](http://npmjs.com/package/camerapi).

First, let's import the `camerapi` module using an ES6 `import` statement...

``` js
import * as Camera from 'camerapi';
```

Now, you instantiate a new camera, set its base folder (where pictures are saved) to the current directory, and then take a picture like this...

``` js
let cam = new Camera();
cam.baseFolder('.');
cam.takePicture('picture.png', (file,error) => { ... });
```

That was pretty easy. When the program is run, that code will be executed and a single picture will be taken and saved as `picture.png` in the same directory where our code is.

Let's move on now to sending that image to Microsoft Cognitive Services to see what's in it.

### Analyzing the Image with Cognitive Services
Up at the top of your file add another import to bring in the [`project-oxford`](http://npmjs.com/package/project-oxford) module. _Project Oxford_ was the code name for Microsoft Cognitive Services and is a really good Node.js SDK. You also need an import for the `fs` core node module since we'll use that to read a file.

``` js
import * as oxford from 'project-oxford';
import * as fs from 'fs';
```
Now it's time to use that Cognitive Services key you got earlier. Paste this code in somewhere below the project-oxford import and replace the key...

```js
let client = new oxford.Client('<your API key>');
```

Now to actually use the service to analyze an image. Inside your `takePicture` callback, add this...

``` js
client.vision.analyzeImage({ path: 'picture.png', Tags: true }).then(result => {
    let tags = result.tags.map(t => t.name);
    console.log(JSON.stringify(tags, undefined, 4));
    fs.unlinkSync('picture.png'); //delete the picture
});
```  

That calls the `analyzeImage()` method passing it the name of the picture that we just took. Notice that we couldn't call this before the takePicture callback fired because that picture wouldn't exist yet. We also tell the API that we're interested in the tags by adding `Tags: true`.

Instead of using a callback, this SDK uses promises (nice!), so the function we pass to the `.then()` method is what happens after the response comes back from the service.

You can do whatever you want with the result, but here we're using a `map()` to get just the tag name and then console logging that to the screen. We also delete the picture so we're ready for the next one.

Next we need to get that result up to an IoT Hub so we can do all kinds of cloud magic to it.

### Sending Data to IoT Hub
To wire up IoT Hub, you start with a couple of imports...

``` js
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';
```

The first is a generic module for Azure IoT device code, and the second is specific to whatever IoT protocol we choose. We're choosing to use AMQP here.

Now we'll drop our connection string in. Note that this is not the "IoT Hub" connection string. This is the "device connection string". You can get this by using the [IoT Hub Explorer utility](https://www.npmjs.com/package/iothub-explorer) or by browsing the Devices in the Azure Portal. We'll also use that connection string to create our IoT Hub client.

``` js
var connectionString = 'HostName=cfhub.azure-devices.net;DeviceId=<deviceid>;SharedAccessKey=0ZDUbn/1hTIgKtl4sfLYD+peW63aNnQgQhkVCi99i88=';
var hubClient = deviceAmqp.clientFromConnectionString(connectionString);
```

And finally, we want to send a message to the IoT Hub every time an image is analyzed. Add the following to the end of the code in the callback...

``` js
var message = new device.Message(JSON.stringify({ deviceId: '<deviceid>', tags: tags }));
hubClient.sendEvent(message);
```

## Deploying to the Device

## Writing the Hub Listener Code

