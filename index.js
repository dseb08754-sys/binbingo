const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const path = require('path');

// 1. ትክክለኛ መረጃዎች እና ኪዮች
const BOT_TOKEN = '8913189775:AAEwStmQ6Fv9uvPxMx3NrGYUuVoIybSNhDs';
const SUPABASE_URL = 'https://lwqqzkjxcswxebkultyl.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_secret_TUbe2ZuwxM0zmJbrdEbcbw_3ldulZ4g';
const REQUIRED_CHANNEL = '@Bingobingoethiobot';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WEB_APP_URL = 'https://binbingo-8epo.onrender.com';

const app = express();
const PORT = process.env.PORT || 3000;

// የስታቲክ ፋይሎች (HTML, CSS, JS) ማስተናገጃ
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. ፕሮፌሽናል ዋና ዋና የኪቦርድ አዝራሮች
const mainKeyboard = Markup.keyboard([
  ['🎮 Play'],
  ['💰 Deposit', '🦋 Withdraw'],
  ['💳 Balance'],
  ['📞 Support', '📖 Instructions'],
  ['🎁 Invite']
]).resize();

// 3. ቻናል የመቀላቀል ሁኔታን ማረጋገጫ
async function checkSubscription(userId) {
  try {
    const chatMember = await bot.telegram.getChatMember(REQUIRED_CHANNEL, userId);
    return ['creator', 'administrator', 'member'].includes(chatMember.status);
  } catch (e) {
    return true;
  }
}

// 4. /start ትዕዛዝ
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name;

  const isJoined = await checkSubscription(userId);
  if (!isJoined) {
    return ctx.reply(
      `👋 ሰላም ${firstName}!\n\nቦቱን ለመጠቀም መጀመሪያ ከታች ያለውን ሊንክ በመጫን ቻናላችንን መቀላቀል አለብዎት።`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 ቻናሉን ይቀላቀሉ (Join Channel)', url: 'https://t.me/Bingobingoethiobot' }],
            [{ text: '✅ ተቀላቅለዋል (Check)', callback_data: 'check_join' }]
          ]
        }
      }
    );
  }

  try {
    const { data } = await supabase.from('users').select('*').eq('telegram_id', userId).single();
    if (!data) {
      await supabase.from('users').upsert({ telegram_id: userId, balance: 10 }, { onConflict: 'telegram_id' });
    }
  } catch (err) {}

  ctx.reply(
    `✨✨ እንደንዳ ደኑ ስንመ ${firstName}! ✨✨\n\n` +
    `🎉 ወደ Bingo Bingo ፕሮፌሽናል ሎቢ በደህና መጡ! 🎉\n\n` +
    `✅ ምዝገባዎ ተሳክቷል! የመጀመሪያ ስጦታ 10 ብር ተሠጥቷል።`,
    mainKeyboard
  );
});

bot.action('check_join', async (ctx) => {
  const userId = ctx.from.id;
  const isJoined = await checkSubscription(userId);

  if (!isJoined) {
    return ctx.answerCbQuery('⚠️ እባክዎ መጀመሪያ ቻናሉን ይቀላቀሉ!', { show_alert: true });
  }

  await ctx.deleteMessage();
  ctx.reply('✅ እናመሰግናለን! አሁን ጨዋታውን መጀመር ይችላሉ።', mainKeyboard);
});

// 5. ሜኑ ትዕዛዞች
bot.hears('🎮 Play', (ctx) => {
  ctx.reply('🎮 ጨዋታውን ለመጀመር ከታች ያለውን ቁልፍ ይጫኑ፡', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🚀 ጨዋታ ክፈት (Open Game)', web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
});

bot.hears('💳 Balance', async (ctx) => {
  const userId = ctx.from.id;
  try {
    const { data } = await supabase.from('users').select('balance').eq('telegram_id', userId).single();
    const balance = data ? data.balance : 10;
    ctx.reply(`💳 የእርስዎ ቀሪ ሂሳብ:\nብር ${balance}`);
  } catch (e) {
    ctx.reply(`💳 የእርስዎ ቀሪ ሂሳብ:\nብር 10`);
  }
});

bot.hears('💰 Deposit', (ctx) => {
  ctx.reply(
    `💰 **ገንዘብ ገቢ (Deposit) ለማድረግ፦**\n\n` +
    `እባክዎ በቴሌብር ቁጥር፦ **+251967820050** ገንዘብ ያስተላልፉ።\n\n` +
    `ትራንስፌር ካደረጉ በኋላ ስክሪንሹት ወይም SMS በመያዝ ለአድሚን **@Bingbingchat** ይላኩ።`,
    { parse_mode: 'Markdown' }
  );
});

bot.hears('🦋 Withdraw', (ctx) => {
  ctx.reply('🦋 ገንዘብ ለማውጣት የሚፈልጉትን መጠን እና የባንክ/ቴሌብር መረጃዎን ለአድሚን @Bingbingchat ይላኩ።');
});

bot.hears('📖 Instructions', (ctx) => {
  ctx.reply('📖 **የቢንጎ ጨዋታ መመሪያዎች:**\n1. ካርቴላ ይምረጡ።\n2. ቁጥሮች ሲጠሩ ይከታተሉ።\n3. ሲጨርሱ ቢንጎ ይበሉ!');
});

bot.hears('📞 Support', (ctx) => {
  ctx.reply('🛠️ ማንኛውም ጥያቄ ወይም እርዳታ ካሎት እዚህ ያግኙን: @Bingbingchat');
});

bot.hears('🎁 Invite', (ctx) => {
  const botUsername = ctx.botInfo.username;
  const inviteLink = `https://t.me/${botUsername}?start=${ctx.from.id}`;
  ctx.reply(`🎁 ጓደኛዎችዎን በመጋበዝ ሽልማት ያግኙ!\n\nየእርስዎ መጋበዣ ሊንክ:\n${inviteLink}`);
});

// 6. ሰርቨር እና ቦቱን በአንድ ላይ ማስጀመር
bot.launch();
app.listen(PORT, () => {
  console.log(`Bingo Bingo server and bot running on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
