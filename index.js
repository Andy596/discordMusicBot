const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const sodium = require('libsodium-wrappers');  // Import libsodium-wrappers
require('dotenv').config();

// Initialize libsodium-wrappers
sodium.ready.then(() => {
    console.log('libsodium-wrappers initialized.');
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

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
        
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });
        
        const stream = ytdl(url, { filter: 'audioonly' });
        const player = createAudioPlayer();
        const resource = createAudioResource(stream);
        
        player.play(resource);
        connection.subscribe(player);
        
        player.on('error', error => {
            console.error('Error:', error);
        });
        
        message.reply(`Now playing: ${url}`);
    }
});

client.login(process.env.TOKEN);
