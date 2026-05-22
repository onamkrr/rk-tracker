exports.handler = async () => {
  const h = {"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
  try {
    const token = process.env.TG_BOT_TOKEN;
    if (!token) return {statusCode:500,headers:h,body:JSON.stringify({error:"Bot not configured"})};
    const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const d = await r.json();
    const updates = d.result||[];
    if (!updates.length) return {statusCode:200,headers:h,body:JSON.stringify({chatId:null})};
    const last = updates[updates.length-1];
    const chatId = last?.message?.chat?.id || last?.my_chat_member?.chat?.id || null;
    return {statusCode:200,headers:h,body:JSON.stringify({chatId:String(chatId||"")})};
  } catch(e) {return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})};}
};
