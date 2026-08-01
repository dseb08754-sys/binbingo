const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js'); 

// 1. ማገናኛ ቁልፎችን እዚህ ጋር አስገባ
const BOT_TOKEN = '8913189775:AAEwStmQ6Fv9uvPxMx3NrGYUuVoIybSNhDs'; 
const SUPABASE_URL = 'https://lwqqzkjxcswxebkultyl.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_secret_TUbe2ZuwxM0zmJbrdEbcbw_3ldulZ4g'; 

// 2. ቦቱን እና ዳታቤዙን ማስጀመር
const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY); 

// 3. ተጠቃሚው /start ሲል የሚሰራው ትዕዛዝ
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name; 

    try {
        // ተጠቃሚውን ዳታቤዝ ውስጥ መፈለግ ወይም አዲስ መፍጠር
        const { data, error } = await supabase
            .from('users')
            .upsert([{ telegram_id: userId, balance: 0 }], { onConflict: 'telegram_id' }); 

        if (error) throw error; 

        // ለተጠቃሚው የእንኳን ደህና መጣህ መልዕክት እና አፑን መክፈቻ ቁልፍ መላክ
        ctx.reply(`ሰላም ${firstName}! ወደ Bingo bingo በደህና መጡ! ጨዋታውን ለመጀመር ከታች ያለውን ቁልፍ ይጫኑ።`, {
            reply_markup: {
                inline_keyboard: [
                    { text: '🎮 ጨዋታን መጀመር', web_app: { url: 'https://binbingo-8epo.onrender.com' } }

                ]
            }
        });
    } catch (err) {
        console.error("Database Error:", err.message);
        ctx.reply("ይቅርታ፣ ሲስተሙ ላይ ችግር አጋጥሟል። እባክዎ ትንሽ ቆይተው ይሞክሩ።");
    }
}); 

// ቦቱን ማሰራት
bot.launch();
console.log("Bingo bingo bot started successfully..."); 

// (ይህ ኮድ ቦቱ እንዳይዘጋ ይረዳል)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bingo Bingo Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
