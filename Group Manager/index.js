const { Telegraf, Markup } = require('telegraf');
const { message, editedMessage, channelPost, editedChannelPost, callbackQuery } = require('telegraf/filters');
const { MongoClient } = require('mongodb');

// Configuration, will make commandline args later
const bot = new Telegraf("5453290085:AAGYSe5bgAMUZh_Mrmu-ylJzjmqaaqJWMFI");
const dbUri = "mongodb://127.0.0.1:27017";

// Connect to DB

const client = new MongoClient(dbUri);
try {
    client.connect();
    client.db("arch").command({ ping: 1 });
    console.log("[DATABASE] OPENED CONNECTION");

} catch (error) {
    console.log(error);
}

//Bot middleware
bot.catch(async (error, ctx) => {
    await next();
});

// Bot Interactions
bot.start( async (ctx) => {
    let welcomeFooter = "*Commands*\n/vouches \\- *Check a users reputation\\.*\n\nt\\.me/ArchMarkets";
    ctx.replyWithMarkdownV2(`Thank you for choosing to join the Arch Markets${ctx.chat.username != "" ? `, *@${ctx.chat.username}*\\.\n\n` + `${welcomeFooter}` : "\\. *Please create a username for your account before attempting to join\\.*" + `${welcomeFooter}` }`);
});

bot.command('addtodb', async (ctx) => {
    // Add roles eventually
    if (ctx.from.username != "GotTheGreens") { ctx.reply("Only the owner can use that command!");  return }
    
    let query = { user: { username: ctx.from.username, user_id: ctx.from.id } }
    let userDocument = await client.db('arch').collection('users').findOne(query);

    if (userDocument == null) {
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
        console.log(`[DATABASE] adding ${{ user: user, reputation: reputation, moderation: moderation }} to DB`);
        await client.db('arch').collection('users').insertOne({ user: user, reputation: reputation, moderation: moderation });
    } else {
        ctx.reply('Aready added to db!');
    }

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
    try {
        await ctx.deleteMessage(ctx.message.message_id);
        if (ctx.from.username == undefined || ctx.from.username == "") {;
            await ctx.telegram.sendMessage(ctx.from.id, "Please create a username for your account before joining.");

            // Make it ban for 30 seconds later
            await ctx.telegram.banChatMember(ctx.chat.id, ctx.from.id);
            await ctx.telegram.unbanChatMember(ctx.chat.id, ctx.from.id);
        } else {
            let query = { user: { username: ctx.from.username, user_id: ctx.from.id } }
            let userDocument = await client.db('arch').collection('users').findOne(query);
            if (userDocument == null) {
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
                console.log(`[DATABASE] adding ${ctx.from.id} | @${ctx.from.username}`);
                await client.db('arch').collection('users').insertOne({ user: user, reputation: reputation, moderation: moderation });
            }
        }
    } catch (error) {

    }
});

bot.on(message('left_chat_member'), async (ctx) => {
    try {
        await ctx.deleteMessage(ctx.message.message_id);
    } catch (error) {

    }
});

// API interactions
bot.on(message(''))

bot.launch();
console.log('[BOT] BOT STARTED');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));