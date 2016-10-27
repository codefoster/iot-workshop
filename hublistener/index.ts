import * as eh from 'azure-event-hubs'

let connectionString = 'HostName=iot-workshop-hub.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=RqrUPHRia79Ao86B0a9gMF+G9B6j6DjDSfKw7kAXJ8Q=';
var hubClient = eh.Client.fromConnectionString(connectionString);

hubClient.open()
    .then(hubClient.getPartitionIds.bind(hubClient))
    .then(pids => 
        pids.map(pid => 
            hubClient.createReceiver('$Default', pid, { 'startAfterTime': Date.now() })
                .then(receiver => {
                    console.log('Created partition receiver: ' + pid)
                    receiver.on('errorReceived', err => console.log(err.message));
                    receiver.on('message', m => console.log(JSON.stringify(m.body)));
                })
        )
    )
    .catch(err => console.log(err.message));
