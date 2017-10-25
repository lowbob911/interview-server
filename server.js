var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 7000});
var vss = new WebSocketServer({port: 1111});
var currentMessage = "{}";
var stats = [];

wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(data) {
        var mess = JSON.parse(data);

        if(mess.type==="interview" || mess.type==="stop") {
            currentMessage=data;
            if(mess.type==="interview") {
                stats=[];

                mess.questions.forEach(function each(quest) {
                   stats.push({
                       id: quest.id,
                       text: quest.text,
                       votes: 0
                   })
                });
            }
        }

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === 1) {
                client.send(data);
            }
        });
    });

    ws.send(currentMessage);
});

vss.on('connection', function connection(ws) {

    ws.on('message', function incoming(data) {
        var mess = JSON.parse(data);

        stats.forEach(function each(stat) {
            if (stat.id === mess.id) {
                stat.votes +=1;
            }
        });

        vss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === 1) {
                client.send(data);
            }
        });
    });

    ws.send(JSON.stringify({
        type: "stats",
        stats: stats
    }));
});
