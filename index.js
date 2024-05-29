const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

let connection;
let player;
let currentResource;

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!play')) {
        const args = message.content.split(' ');
        if (args.length < 2) {
            message.reply('Please provide a YouTube URL.');
            return;
        }
        
        const url = args[1];
        if (!ytdl.validateURL(url)) {
            message.reply('Please provide a valid YouTube URL.');
            return;
        }
        
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            message.reply('You need to be in a voice channel to play music.');
            return;
        }
        
        connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });
        
        const stream = ytdl(url, { filter: 'audioonly' });
        player = createAudioPlayer();
        currentResource = createAudioResource(stream);
        
        player.play(currentResource);
        connection.subscribe(player);
        
        player.on('error', error => {
            console.error('Error:', error);
        });
        
        message.reply(`Now playing: ${url}`);
    } else if (message.content === '!stop') {
        if (player) {
            player.stop();
            connection.destroy();
            message.reply('Stopped playing and left the voice channel.');
        } else {
            message.reply('No audio is currently playing.');
        }
    } else if (message.content === '!pause') {
        if (player && player.state.status === AudioPlayerStatus.Playing) {
            player.pause();
            message.reply('Paused the current audio.');
        } else {
            message.reply('No audio is currently playing.');
        }
    } else if (message.content === '!resume') {
        if (player && player.state.status === AudioPlayerStatus.Paused) {
            player.unpause();
            message.reply('Resumed the current audio.');
        } else {
            message.reply('No audio is currently paused.');
        }
    } else if (message.content === '!help') {
        message.reply('Available commands:\n!play [YouTube URL]\n!stop\n!pause\n!resume\n!help');
    }
});

client.login(process.env.TOKEN);
