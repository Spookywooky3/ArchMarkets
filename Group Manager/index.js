const { Telegraf, Markup } = require('telegraf');
const { message, editedMessage, channelPost, editedChannelPost, callbackQuery } = require('telegraf/filters');
const { moment } = require('moment');
const { MongoClient } = require('mongodb');

// Configuration, will make commandline args later
const bot = new Telegraf("5453290085:AAGYSe5bgAMUZh_Mrmu-ylJzjmqaaqJWMFI");
const dbUri = "mongodb://localhost:27017/arch";

// Connect to DB
const dbClient = new MongoClient(dbUri);


// Bot Interactions
bot.start( async (ctx) => {
    let welcomeFooter = "*Commands*\n/vouches \\- *Check a users reputation\\.*\n\nt\\.me/ArchMarkets";
    ctx.replyWithMarkdownV2(`Thank you for choosing to join the Arch Markets${ctx.chat.username != "" ? `, *@${ctx.chat.username}*\\.\n\n` + `${welcomeFooter}` : "\\. *Please create a username for your account before attempting to join\\.*" + `${welcomeFooter}` }`);
});

bot.command('updategroup', async (ctx) => { 
    try {
        if (ctx.from.username != "GotTheGreens") { ctx.reply("Only the owner can use that command!");  return }  
        
        let text = ctx.message.text.replace('/updategroup ', '');

        let finalText = "";
        for (let i = 0; i < text.length; i++) {
            if (text[i] != '.' && text[i] != '-') {
                finalText += text[i];
            } else {
                finalText += '\\' + text[i];
            }
        }

        await ctx.telegram.sendMessage('@ArchMarkets', finalText, { reply_markup: { inline_keyboard: [[{ text: '♱ 𝔄𝔯𝔠𝔥 𝔅𝔲𝔡𝔰 ♱', 'url': 't.me/ArchBuds'}]] }, parse_mode : 'MarkdownV2'});
    }
    catch (e) {
        console.log(e);
    }
});

bot.command('quit', async (ctx) => { await ctx.leaveChat(); });

// Group Interactions
bot.on(message('new_chat_members'), async (ctx) => {
    ctx.deleteMessage(ctx.message.message_id);
    if (ctx.from.username == undefined || ctx.from.username == "") {;
        await ctx.telegram.sendMessage(ctx.from.id, "Please create a username for your account before joining.");

        // Make it ban for 30 seconds later
        await ctx.telegram.banChatMember(ctx.chat.id, ctx.from.id);
        await ctx.telegram.unbanChatMember(ctx.chat.id, ctx.from.id);
    } else {
        let userDocument = await dbClient.db('arch').collection('users').findOne({ username : ctx.from.username });
        
        if (userDocument == { }) {
            let user = { 
                username: ctx.from.username,
                user_id: ctx.from.id
            }
            let reputation = {
                verifiedUser: false,
                verifiedDealer: false,
                reputation: 0,
                positiveVouches: [],
                negativeVouches: []
            }
            let moderation = {
                banned: false,
                muted: false,
                admin: false,
                warns: []
            }
            await dbClient.db('arch').collection('users').insertOne({ user: user, reputation: reputation, moderation: moderation });
        }
    }
});

bot.on(message('left_chat_member'), async (ctx) => {
    ctx.deleteMessage(ctx.message.message_id);
});

dbClient.connect();
dbClient.db("arch").command({ ping: 1 });
console.log('[DATABASE] CONNECTED SUCCESSFULLY');

bot.launch();


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));