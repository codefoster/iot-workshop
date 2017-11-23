let eh = require('azure-event-hubs');

var hubClient = eh.Client.fromConnectionString(process.env.HUB_CONNECTION_STRING);

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
