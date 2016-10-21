# Instructions

## Overview
purpose, strategy, reasons, etc.

## Taking inventory
* Raspberry Pi
* Raspberry Pi camera module
* SD card
* Network cable
* Power cable

a bit of description on each

## Installing Raspbian
could just link to other instructions instead of including here

## Installing Node
mention how many different ways there are to install Node
then give my favorite method

``` bash
wget http://nodejs.org/dist/v6.9.1/node-v6.9.1-linux-armv7l.tar.xz
tar -xf node-v6.9.1-linux-armv7l.tar.xz
sudo mv node-v6.9.1-linux-armv7l /usr/local/node/v6.9.1
cd /usr/local/bin
sudo ln -s /usr/local/node/v6.9.1/bin/node node
sudo ln -s /usr/local/node/v6.9.1/bin/npm npm
node -v
npm -v
```

## Writing the Device Code

## Deploying to the Device

## Writing the Hub Listener Code

