move typescript global install to the section where we use it
remove the iothub-explorer instructions since i factored those out

# Instructions

## Overview
{ purpose, strategy, reasons, etc. }

## Prerequisites
* an IDE
* Node v6
* TypeScript
* ability to `scp` (add git bin path or use bash on Windows)

## Setup
Unless you have a good reason to choose otherwise, we recommend you [install Visual Studio Code](http://code.visualstudio.com) so you can more easily follow along with us. It works on Mac, Linux, and Windows.

If you haven't already, you need to get Node v6 installed on your _host machine_. The easiest way is to go to [nodejs.org](http://nodejs.org) and hit the big green button.

You also need the TypeScript module installed globally. At your command prompt type `npm install -g typescript`.

Finally, you need the ability to copy files to your device using the `scp` command. Type `scp` at your command prompt to see if you have it. If you don't, the easiest way is to install Git for Windows and be sure to change one of the default options. On the wizard screen titled _Adjusting your PATH environment_ choose the third option - _Run Git and included Unix tools from the Windows Command Prompt_. If you've already got Git and didn't choose this option, then just modify your system PATH variable and add the path to your Git usr/bin folder. Mine's at `C:\program files\git\usr\bin`. 

## Taking inventory
Here's what you should have in your kit...

* Raspberry Pi 3
* Raspberry Pi camera module
* SD card
* Network cable
* Power cable

The Raspberry Pi 3 (RP3) is obviously the brains of the operation here. It's essentially a tiny computer with controllable pins. We've equipped these ones with a Raspberry Pi camera module too. Of course, you could just plug a webcam in to one of the USB ports, but the camera module uses the CSI port on the board and is faster and has drivers built in to the device.

The RP3 doesn't have any built in storage, but uses an SD card slot. We have Raspbian - Raspberry Pi's custom distribution of Linux - installed along with Node.js. This makes each of these devices a very capable machine.

The RP3 is powered with a standard micro-USB port and can talk with built-in wifi to the network. We have an ethernet cable here for you too just for getting started.

## Installing Raspbian
Installing an operating system on an IoT device is not hard, but it does take a bit of time, so *these devices are all done for you*.

If you were going to do it yourself, here would be how you'd get started with that.

Your first choice would be which operating system.

Use *Windows 10 IoT Core* if you want a generally easy and well-curated platform that's capable of a lot of code reuse between apps on the IoT device and apps running on other Windows platforms. If you want to install Windows 10 IoT Core, go to [windowsondevices.com](http://windowsondevices.com) to learn how.

The alternative is *Linux*. Although it's possible to run various distributions on a RP3, there's not reason not to run Raspbian. You can choose the full version or you can go with the _Lite_ edition. The full version of Raspbian gives you the GUI desktop and a lot of apps, services, and drivers. The Lite version is best for a simple command line instance of Raspbian without all the cruft. For either one, go to [Raspberry Pi's download page](https://www.raspberrypi.org/downloads/raspbian/).

## Installing Node
Like the operating system, *Node has already been installed for you*.

If you're following these instructions on your own device though, you'll want to know how to get started with that, so let's go.

There are a variety of ways to install Node on a Linux device. A Raspberry Pi is a bit of a special condition because it's an ARM processor and many of the versions of Node.js were never built for ARM. The more current versions all support it fine, though, so you'll be in good shape.

I'll mention the other ways I know of to install Node and then tell you my favorite.

* You can set your apt-get registries correctly, update apt-get, and then do a `sudo apt-get install nodejs nodejs-legacy`. The awkward thing there is that in Ubuntu's package store Node.js is called `nodejs`... not `node`. That's why the `nodejs-legacy` package is required. It gives you the ability to type `node` on the command line and get what you expect.
* You can install NVM (Node Version Manager) and then use it to install one or more versions of Node.js and easily and quickly switch between them. This method burned me on a Raspberry Pi once though because it left an old version of Node which was still being referenced by the device's GPIO pins. I wasted a lot of time on that problem. Details [here](http://codefoster.com/pi-oldnode) in case you care.
* Finally, you can simply wget the bits you know you need for your architecture, put them in the right place, and set your links. Like this...

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

    The `wget` line downloads it.
    
    The `tar` line decompresses it.
    
    The `sudo mv` line puts it in the right place.
    
    And the `ln` commands set up your links for both node and npm.

## The project idea
For this workshop, we're going to program our RP3 to take a picture, call a service to get a list of _tags_ representing the things it sees in the picture, and then send those tags to our IoT Hub. From there, we'll take a look at the myriad of things we might want to do with that data.

## Getting set up with Cognitive Services
Microsoft Cognitive Services is great because it's very powerful and yet very easy to use.

Cognitive Services is essentially a whole bunch of very complicated machine learning happening for you through a very easy to call API.

With it you can do things like detect what objects are in an image, validate that the person speaking to the computer is who they say they are, turn text into speech or speech into text, perform optical character recognition (OCR), and a ton more.

We're going to play around with the various services so you understand what all is possible, and youc an do the same thing at [microsoft.com/cognitive](http://microsoft.com/cognitive).

While you're on that site, you can click [Get started for free](https://www.microsoft.com/cognitive-services/en-us/sign-up) to get your own API keys for calling these services. 

In order to access Cognitive Services without resorting to low-level REST calls, we'll use the [http://npmjs.com/package/project-oxford](project-oxford) node module. It will be a cinch.

## Creating our IoT Hub
Azure IoT Hub is sort of the center of it all. You can have millions of extremely chatty devices talking to one IoT Hub witihout a problem, and then you can do all sorts of fun things with those messages on the backend.

We'll walk through the creation of an IoT Hub. This step too is very easy, but you will need an Azure subscription. If you don't have one already, go to [azure.com](http://azure.com) and click to start the free trial.

To create our hub, we'll start by creating a Resource Group. A Resource Group is a logical group of resources that often represent a single solution and are likely deployed together, managed together, and deleted together. I called mine `iot-workshop`, but you can call yours whatever you want.

{ image }

Next, we'll hit the plus button above the Resources list in our Resource Group (RG) and search to find the IoT Hub resource. That will bring us to this short form to fill out.

{ image }

And that's it!

## Registering a Device
We have a hub, but there has to be an explicit registration for every device that checks in to it. That's so that unauthorized code is unable to act like one of our devices and send spoofed messages.

Let's use the `iothub-explorer` utility to add a device.

First install it...

```
npm install -g iothub-explorer
```

Now go to your Azure Portal and get your `iothubowner` shared access policy connection string.

Now log in to IoT Hub Explorer using...

```
iothub-explorer login '<connection string>'
```

And finally, you can register a device using...

```
iothub-explorer create '<device id>'
```

## Writing the Device Code
Now we need to write some code to send to our RP3. This code needs to...

1. take a picture
1. cog the picture
1. send the results to IoT Hub

We're going to use TypeScript for this workshop because...

- it's awesome
- it's easy
- it gets us in the habit of writing ES6 code

We'll write the code on our host machine and then copy it to the device. IoT devices don't take specific code, so we should be able to run the same code on our host machine as on our device. Devices often have hardware that our host machine doesn't have (the Raspberry Pi camera module in this case), so we'll have to send our code to the device to test that.

We need to start with getting our project setup...

- make yourself a new folder wherever you want on your machine
- on your command line go to that folder and run `npm init -y` (that will create a package.json file for you)
- now create a `tsconfig.json` file in the project and paste in the contents from [here](http://codefoster.com/tsconfig)
- finally, create a file called index.ts and that's where we'll put our code

{ talk about creating the package.json, tsconfig.json, and index.ts }

### Connecting to our IoT Hub
Go to your IDE and edit the `index.ts` file and let's start by wiring up IoT Hub. We need a couple of imports...

``` js
import * as device from 'azure-iot-device';
import * as deviceAmqp from 'azure-iot-device-amqp';
```

We need to actually install these modules too, so do this at your command line...

```
npm install azure-iot-device azure-iot-device-amqp --save
```

The first is a generic module for Azure IoT device code, and the second is specific to whatever IoT protocol we choose. We're choosing to use AMQP here.

Now we'll drop our connection string in. Note that this is not the "IoT Hub" connection string. This is the "device connection string".

You can get this by using the IoT Hub Explorer utility again. Just do...

```
iothub-explorer list --connection-string
```

The `--connection-string` argument tells the utility to return the connection string so we can copy it.

Then we'll use that connection string to create our IoT Hub client.

``` js
let connectionString = '<device connection string>';
let hubClient = deviceAmqp.clientFromConnectionString(connectionString);
```

Now we can open a connection to our IoT Hub...

``` js
hubClient.open(err => {
    if (err) console.log(err)
    else {
        //happy path
    }
})
```

And if the connection doesn't open, an error will be reported. The rest of our code should go there in the happy path.

### Taking a Picture
If you're on the command line of the Raspberry Pi, you use the `raspicam` utility to take a photo or video. If you're writing an application in Node.js, however, you use a module to wrap that call to `raspicam`. The module I chose is called [`camerapi`](http://npmjs.com/package/camerapi).

Import the `camerapi` module using an ES6 `import` statement. It's good convention to always put your imports at the top of your code file...

``` js
import * as Camera from 'camerapi';
```
Again, we need to do the actual install, so at your command line do...

```
npm install camerapi --save
```

Now, where I put `//happy path` you instantiate a new camera, set its base folder (where pictures are saved) to the current directory, and then take a picture like this...

``` js
let cam = new Camera();
cam.baseFolder('.');
cam.takePicture('picture.png', (file,error) => {
    //happy path    
});
```

That was pretty easy. When the program is run, after a connection to the IoT Hub is established (a connection we're not using yet by the way), that code will be executed and a single picture will be taken and saved as `picture.png` in the same directory where our code is.

Let's move on now to sending that image to Microsoft Cognitive Services to see what's in it.

### Analyzing the Image with Cognitive Services
Up at the top of your file add another import to bring in the [`project-oxford`](http://npmjs.com/package/project-oxford) module. _Project Oxford_ was the code name for Microsoft Cognitive Services and is a really good Node.js SDK. You also need an import for the `fs` core node module since we'll use that to read a file.

``` js
import * as oxford from 'project-oxford';
import * as fs from 'fs';
```

And install `project-oxford` from the command line. The `fs` module is built in to node and doesn't need to be installed...

```
npm install project-oxford --save
```

Now it's time to use that Cognitive Services key you got earlier. Paste this code in somewhere below the project-oxford import and replace the key...

```js
let cogClient = new oxford.Client('<your API key>');
```

Now to actually use the service to analyze an image. Inside your `takePicture` callback where I put `//happy path`, add...

``` js
cogClient.vision.analyzeImage({ path: 'picture.png', Tags: true })
    .then(result => {
        fs.unlinkSync('picture.png'); //delete the picture
        //happy path
    });
```  

That calls the `analyzeImage()` method passing it the name of the picture that we just took. Notice that we couldn't call this before the takePicture callback fired because that picture wouldn't exist yet. We also tell the API that we're interested in the tags by adding `Tags: true`.

Instead of using a callback, this SDK uses promises (nice!), so the function we pass to the `.then()` method is what happens after the response comes back from the service.

Here we're taking the result as is, but there's a good chance you would want to do some conditioning on that object here. We also delete the picture so we're ready for the next one.

Next we need to get that result up to an IoT Hub so we can do all kinds of cloud magic to it.

### Sending Data to IoT Hub

And finally, we want to send a message to the IoT Hub every time an image is successfully analyzed. Add the following to the happy path...

``` js
let message = new device.Message(JSON.stringify({ deviceId: 'device1', tags: result.tags }));
hubClient.sendEvent(message, (err, res) => {
    if (err) console.log(err);
    else console.log(`Sent ${JSON.stringify(result.tags)} to your IoT Hub`);
    hubClient.close((err, res) => {
        if (err) console.log(err);
    })
});
```
This will create an IoT Hub message, send it, and handle some error cases for us.

You're code complete now! You can check out [my whole file](https://github.com/codefoster/iot-workshop/blob/master/device/index.ts) to make sure you didn't miss anything. Now we just need to get your beautiful code down to your Raspberry Pi!

## Transpiling our TypeScript
This sounds complicated, but far from it. Visual Studio Code is inherently capable of doing this.

Just hit `ctrl + shift + b` to issue the Build command to Visual Studio Code. Your first time running it, Code will ask you to configure your task runner. Go ahead and hit `Configure Task Runner` and then choose `TypeScript - Watch Mode`.

Watch mode means that Code will silently watch in the background for any .ts files to change and will automatically transpile those to .js for you, so you only need to hit `ctrl + shift + b` once per Code session.

## Deploying to the Device
There are many ways to deploy application code to an IoT device, but there's nothing quite as raw as simply copying the files directly over the network.

For this we need `scp`.

There are a number of files in our project now, but there are really only two that we need on our device: `index.js` and `package.json`. If you don't remember creating `index.js` that's because you didn't. TypeScript made that for you when you transpiled. The `package.json` file is important, because it contains the list of dependencies our project has that we'll need to restore.

First, let's create a folder on the device to hold our project files. At your command line in your code folder, run this statement (you'll need your password)...

```
ssh <username>@<device name>.local 'mkdir device'
```

Now this one to copy these two files to the device...
```
scp index.js package.json <username>@<device name>.local:~/device
```

The files are out there are ready to run. I think the easiest way to run them is to open a second console window and `ssh` in directly to the device. Use...

```
ssh <username>@<device name>.local
```

After your first code deployment, you'll need to restore dependencies, you can do that using (you should be `ssh`'ed to your device now)...

```
npm install
```

And now you can run your application using...

```
node .
```

The `.` means "this folder". Node is smart enough to look for an `index.js` file in the current folder and run that.

## Writing the Hub Listener Code

