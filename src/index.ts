import {
    Client,
    Embed,
    EmbedBuilder,
    IntentsBitField,
    embedLength
} from 'discord.js';
import * as path from 'path';

require('dotenv').config({
    path: path.join(__dirname, ".env")
})


const F = IntentsBitField.Flags;
const client = new Client({
    intents: [F.Guilds, F.GuildMessages, F.GuildMembers, F.MessageContent]
})


client.once('ready', async (client) => {
    console.log("ready");
})

client.login(process.env._TOKEN);

client.on('messageCreate', async msg => {
    if (!msg.content.toLowerCase().startsWith('!pick')) return;
    const replied = await msg.reply({content: '<a:loading:1073540546393538570>', allowedMentions: {repliedUser: false}});
    try {
        if (!msg.member ?.permissions.has('ModerateMembers')) throw new Error('You are not allowed to do that!');

        const args = msg.content.split(' ');

        if(!args[1] || !args[2]) throw new Error('Not enough arguments provided');

        const res = (await pick(args[1].replaceAll('<@&', '').replaceAll('>', ''), Number(args[2]))).map(v => '<@' + v + '>');

        await replied.edit({content: res.reduce((p, v) => p + " " + v)});
    
    } catch (err: any) {
        console.log(err);
        const errBed = new EmbedBuilder()
            .setTitle('An error occurred')
            .setDescription('```md\n' + err.message + '```');
        await replied.edit({
            embeds: [errBed],
            allowedMentions: {repliedUser: false},
            content: 'err'
        });
    }

})

const pick = async (roleId: string, amount: number): Promise < string[] > => {
    try {
        if(Number.isNaN(Number) || amount < 0) throw new Error('please enter a valid number'); 
        
        let winners: string[] = [];

        if (!client.isReady()) throw new Error('client not ready');

        const guild = await client.guilds.fetch('859736561830592522');
        const all = (await guild.members.fetch()).filter(m => m.roles.cache.has(roleId));

        if(amount > all.size) throw new Error('Amount cannot be bigger than ' + all.size)
        if (all.size === amount) return all.map(m => m.user.id);

        for (let i = 0; i < amount; i++) {
            let picked = "";

            do {
                picked = (all.at(Math.floor(Math.random() * all.size))) ?.user.id as string;
            } while (winners.includes(picked))

            winners.push(picked);
        }


        return winners;

    } catch (err: any) {
        console.log("Err on pick()");
        console.log(err);
        throw new Error(err.message)
    }

}