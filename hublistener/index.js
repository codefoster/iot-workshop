'use strict';

var AMQPClient = require('amqp10').Client;
var Policy = require('amqp10').Policy;
var translator = require('amqp10').translator;
var Promise = require('bluebird');

var protocol = 'amqps';
var eventHubHost = process.env.WACKCOON1_HUBLISTENER_EVENTHUBHOST;
var sasName = process.env.WACKCOON1_HUBLISTENER_SASNAME;
var sasKey = process.env.WACKCOON1_HUBLISTENER_SASKEY;
var eventHubName = 'wackcoon';
var numPartitions = 4;

var filterOffset = new Date().getTime();
var filterOption;
if (filterOffset) {
  filterOption = {
  attach: { source: { filter: {
  'apache.org:selector-filter:string': translator(
    ['described', ['symbol', 'apache.org:selector-filter:string'], ['string', "amqp.annotation.x-opt-enqueuedtimeutc > " + filterOffset + ""]])
    } } }
  };
}

var uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + eventHubHost;
var recvAddr = eventHubName + '/ConsumerGroups/$default/Partitions/';

var client = new AMQPClient(Policy.EventHub);

var messageHandler = function (partitionId, message) {
  console.log('Received(' + partitionId + '): ', message.body);
};

var errorHandler = function(partitionId, err) {
  console.warn('** Receive error: ', err);
};
var createPartitionReceiver = function(partitionId, receiveAddress, filterOption) {
  return client.createReceiver(receiveAddress, filterOption)
    .then(function (receiver) {
      console.log('Listening on partition: ' + partitionId);
      receiver.on('message', messageHandler.bind(null, partitionId));
      receiver.on('errorReceived', errorHandler.bind(null, partitionId));
    });
};

client.connect(uri)
  .then(function () {
    var partitions = [];
    for (var i = 0; i < numPartitions; ++i) {
      partitions.push(createPartitionReceiver(i, recvAddr + i, filterOption));
    }
    return Promise.all(partitions);
})
.error(function (e) {
    console.warn('Connection error: ', e);
});
