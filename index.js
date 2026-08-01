const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. ማስፈንጠሪያ እና ኪዮች ከዲታቤዝ ጋር
const BOT_TOKEN = '8913189775:AAEwStmQ6Fv9uvPxMx3NrGYUuVoIybSNhDs';
const SUPABASE_URL = 'https://lwqqzkjxcswxebkultyl.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_secret_TUbe2ZuwxM0zmJbrdEbcbw_3ldulZ4g';

// 2. ቦት እና ዴታቤዝ ማዋቀር
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const WEB_APP_URL = 'https://binbingo-8epo.onrender.com';

// 3. ዋና ዋና የኪቦርድ አዝራሮች (Reply Keyboards)
const mainKeyboard = Markup.keyboard([
  ['🎮 Play Game'],
  ['💰 Deposit', '🦋 Withdraw'],
  ['💳 Balance'],
  ['📞 Support', '📖 Instructions'],
  ['🎁 Invite Friends']
]).resize();

// 4. /start ትዕዛዝ (ስልክ ቁጥር መጠየቂያ ፎርማት)
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const firstName = ctx.from.first_name;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('phone_number')
      .eq('telegram_id', userId)
      .single();

    if (error || !data || !data.phone_number) {
      // ስልክ ቁጥር ካልተመዘገበ ቁጥር መጠየቂያ বাቶ ማሳየት
      return ctx.reply('ምዝገባውን ለማጠናቀቅ እባክዎ ከዚህ താഴെയുള്ള የመመዝገቢያ ቅጽ ይጫኑ።', {
        reply_markup: {
          keyboard: [
            [{ text: '📱 ስልክ ቁጥር አጋራ (Share Contact)', request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }

    // አስቀድሞ ከተመዘገበ
    ctx.reply(`👋 ሰላም ${firstName}! ወደ Bingo Bingo እንኳን በደህና መጡ።`, mainKeyboard);
  } catch (err) {
    ctx.reply('👋 ሰላም! ወደ Bingo Bingo እንኳን በደህና መጡ።', mainKeyboard);
  }
});

// 5. ስልክ ቁጥር ሲልክ መቀበል እና ማስቀመጥ
bot.on('contact', async (ctx) => {
  const userId = ctx.from.id;
  const phoneNumber = ctx.message.contact.phone_number;

  try {
    await supabase
      .from('users')
      .upsert({ telegram_id: userId, phone_number: phoneNumber, balance: 10 }, { onConflict: 'telegram_id' });

    await ctx.reply('✅ በተሳካ ሁኔታ ተመዝግበዋል!\nብር: 10', mainKeyboard);
    ctx.reply('ለቀጣይ ማሞቂያውን ይጠቀሙ:-', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎮 Play Game', web_app: { url: WEB_APP_URL } }]
        ]
      }
    });
  } catch (err) {
    console.error(err);
    ctx.reply('ይቅርታ፣ በምዝገባ ወቅት ችግር አጋጥሟል።');
  }
});

// 6. የተጠቃሚ ቁልፎች ተግባር
bot.hears('🎮 Play Game', (ctx) => {
  ctx.reply('🎮 ጨዋታውን ለመጀመር ከታች ያለውን ሊንክ ይጫኑ፡', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎮 ጨዋታ ክፈት', web_app: { url: WEB_APP_URL } }]
      ]
    }
  });
});

bot.hears('💳 Balance', async (ctx) => {
  const userId = ctx.from.id;
  try {
    const { data } = await supabase.from('users').select('balance').eq('telegram_id', userId).single();
    const balance = data ? data.balance : 0;
    ctx.reply(`💳 የእርስዎ አካውንት ቀሪ ሂሳብ:\nብር ${balance}`);
  } catch (e) {
    ctx.reply('💳 የእርስዎ አካውንት ቀሪ ሂሳብ:\nብር 0');
  }
});

bot.hears('💰 Deposit', (ctx) => {
  ctx.reply('💰 የሂሳብ ገቢ (Deposit) ለማድረግ በሰርቨሩ ላይ ያሉትን አማራጮች ይጠቀሙ።');
});

bot.hears('🦋 Withdraw', (ctx) => {
  ctx.reply('🦋 ገንዘብ ለማውጣት (Withdraw) የባንክ ወይም የቴሌብር መረጃዎን ያስገቡ።');
});

bot.hears('📞 Support', (ctx) => {
  ctx.reply('📞 ማንኛውም ጥያቄ ካሎት በቤተሰብ ድጋፍ ሰጪ አግኙን @Support');
});

bot.hears('📖 Instructions', (ctx) => {
  ctx.reply('📖 የቢንጎ ጨዋታ አጨዋወት መመሪያዎች እዚህ ይገኛሉ...');
});

bot.hears('🎁 Invite Friends', (ctx) => {
  const botUsername = ctx.botInfo.username;
  const inviteLink = `https://t.me/${botUsername}?start=${ctx.from.id}`;
  ctx.reply(`🎁 ጓደኛዎችዎን በመጋበዝ ሽልማት ያግኙ!\n\nየእርስዎ መጋበዣ ሊንክ:\n${inviteLink}`);
});

// 7. ሰርቨር ማስጀመር
bot.launch();
console.log("Bingo Bingo bot started successfully...");

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bingo Bingo Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

