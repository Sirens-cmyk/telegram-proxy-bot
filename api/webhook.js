export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ status: 'Bot webhook is running!' });
  }

  const update = req.body;
  if (!update.message || !update.message.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = update.message.chat.id;
  const text = update.message.text.trim();
  const token = process.env.TELEGRAM_BOT_TOKEN || update.token; 

  let replyText = "";

  if (text === '/start') {
    replyText = "سلام! 🤖 ربات مانیتورینگ و تریدر مکسی آماده‌ست.\nبرای استعلام قیمت هر ارز، کافیه اسمش رو بفرستی (مثلاً: `BTC` یا `ETH`).";
  } else {
    // فرض رو بر این میذاریم که کاربر اسم ارز رو فرستاده (مثل btc یا btc/usdt)
    let symbol = text.toUpperCase();
    if (!symbol.includes('USDT')) {
      symbol = symbol + 'USDT';
    }

    try {
      // استعلام قیمت آنی از صرافی مکسی
      const response = await fetch(`https://api.mexc.com/api/v3/ticker/price?symbol=${symbol}`);
      const data = await response.json();
      
      if (data && data.price) {
        replyText = `📊 قیمت لحظه‌ای *${symbol}*:\n💵 \`${data.price}\` USDT`;
      } else {
        replyText = `❌ ارز *${symbol}* در صرافی مکسی پیدا نشد یا فرمتش اشتباهه.`;
      }
    } catch (e) {
      replyText = `⚠️ خطا در دریافت قیمت از صرافی: ${e.message}`;
    }
  }

  // ارسال پاسخ به کاربر در تلگرام
  if (token && replyText) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        parse_mode: 'Markdown'
      })
    });
  }

  return res.status(200).json({ ok: true });
}
