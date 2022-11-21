const { Telegraf } = require('telegraf');
const { message, editedMessage, channelPost, editedChannelPost, callbackQuery } = require('telegraf/filters');

// CONFIGURATION
// Will make read from file or commandline later
const bot = new Telegraf("5453290085:AAGYSe5bgAMUZh_Mrmu-ylJzjmqaaqJWMFI");
const welcomeFooter = "*Commands*\n/vouches \\- *Check a users reputation\\.*\n\nt\\.me/ArchMarkets";


// Bot Interactions
bot.start( async (ctx) => {
    ctx.replyWithMarkdownV2(`Thank you for choosing to join the Arch Markets${ctx.chat.username != "" ? `, *@${ctx.chat.username}*\\.\n\n` + `${welcomeFooter}` : "\\. *Please create a username for your account before attempting to join\\.*" + `${welcomeFooter}` }`);
});

bot.command('quit', async (ctx) => { await ctx.leaveChat(); });

// Group Interactions
bot.on('new_chat_members', async (ctx) => {
    console.log(ctx.update.message.from.username);
});


// LAUNCH BOT
bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));