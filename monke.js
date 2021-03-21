const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');

const execSync = require('child_process').execSync;

const fs = require('fs')

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();

    switch(command) {
        case "hail":
            message.channel.send("Well met!");
            break;
        case "restart":
            restartServer().then(message.channel.send("Valheim server restarted. It could take a minute before it appears in-game."), function(result) {console.log(result)});
            break;
        case "status":
            let status = serverStatus();
            if (!status.error) {
                let player_count = status.player_count
                let suffix = ((player_count === 1) ? '' : 's')
                message.channel.send(`Server is up. ${status.player_count} viking${suffix} currently online.`)
            }
            else {
                message.channel.send(`Server is down (${status.error}).`)
            }
    }
});

function restartServer () {
    return new Promise((resolve, reject) => {
        const output = execSync('docker exec valheim-server supervisorctl restart valheim-server', { encoding: 'utf-8' });
        resolve(output)
    })
}

function serverStatus () {
    execSync('docker cp valheim-server:/opt/valheim/htdocs/status.json status.json', { encoding: 'utf-8' });
    return JSON.parse(fs.readFileSync('status.json'))

}

client.login(token);
