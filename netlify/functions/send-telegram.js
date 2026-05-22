exports.handler = async (event) => {
  const h = {"Access-Control-Allow-Origin":"*","Content-Type":"application/json"};
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:h,body:""};
  try {
    const {chatId, message} = JSON.parse(event.body||"{}");
    const token = process.env.TG_BOT_TOKEN;
    if (!token) return {statusCode:500,headers:h,body:JSON.stringify({error:"Bot not configured"})};
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({chat_id:chatId, text:message, parse_mode:"HTML"})
    });
    return {statusCode:200,headers:h,body:JSON.stringify(await r.json())};
  } catch(e) {return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})};}
};
