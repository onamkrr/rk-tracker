// Stores manager submissions in Netlify Blobs
const {getStore} = require("@netlify/blobs");
exports.handler = async (event) => {
  const h = {"Access-Control-Allow-Origin":"*","Content-Type":"application/json",
    "Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,GET,OPTIONS"};
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:h,body:""};
  try {
    const store = getStore("entries");
    if (event.httpMethod === "GET") {
      // Owner fetches pending submissions
      const pwd = event.queryStringParameters?.pwd;
      if (pwd !== process.env.OWNER_PWD) return {statusCode:401,headers:h,body:JSON.stringify({error:"Unauthorized"})};
      const list = await store.list();
      const entries = await Promise.all(list.blobs.map(b => store.get(b.key, {type:"json"})));
      return {statusCode:200,headers:h,body:JSON.stringify({entries})};
    }
    const entry = JSON.parse(event.body||"{}");
    const id = Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    await store.set(id, JSON.stringify({...entry, id, submittedAt: new Date().toISOString()}));
    // Notify owner via Telegram
    const token = process.env.TG_BOT_TOKEN;
    const chatId = process.env.TG_OWNER_CHAT_ID;
    if (token && chatId) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({chat_id:chatId,
          text:`📥 <b>New entry from manager</b>\n\n📌 ${entry.title||"(no title)"}\n👤 ${entry.person||""}\n💰 ${entry.amount||""}\n📂 ${entry.taskType||""}`,
          parse_mode:"HTML"})
      });
    }
    return {statusCode:200,headers:h,body:JSON.stringify({success:true,id})};
  } catch(e) {return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})};}
};
