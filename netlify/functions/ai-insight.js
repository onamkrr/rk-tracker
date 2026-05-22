exports.handler = async (event) => {
  const h = {"Access-Control-Allow-Origin":"*","Content-Type":"application/json",
    "Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST,OPTIONS"};
  if (event.httpMethod === "OPTIONS") return {statusCode:200,headers:h,body:""};
  try {
    const {entries, question} = JSON.parse(event.body||"{}");
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return {statusCode:500,headers:h,body:JSON.stringify({error:"AI not configured"})};

    const summary = entries.slice(0,80).map(e =>
      `[${e.date}] ${e.title} | Type:${e.taskType||"-"} | Person:${e.person||"-"} | Account:${e.account||"-"} | Amount:${e.amount||"-"} | Status:${e.paymentStatus||"-"} | Tags:${(e.tags||[]).join(",")} | Notes:${(e.notes||"").slice(0,80)}`
    ).join("\n");

    const systemPrompt = `You are a business intelligence assistant for Onam Agarbathi Pvt. Ltd., a 100+ year old Bangalore-based incense manufacturer (Vaishak brand). You help the owner Ravikiran analyse his life and business tracker data. You understand:
- Incense/agarbathi industry: raw materials (bamboo sticks, wood powder, jigat/binder, charcoal, masala, fragrance oils, essential oils, DOP, DEP, synthetic musks, aroma chemicals like galaxolide, iso e super, hedione, coumarin, etc.)
- Indian business terms: GST, PT, ESI, EPF, CPC (canteen stores), CSD (canteen stores department)
- His accounts: Kotak, IDBI, ICICI, Zerodha, IndMoney, Greenbay property, 846 property
- People: Prakash, Satish (auditor), Maadhu, Virupaksha, Gopal Reddy
- Financial items: 194 TDS deposits, 9950 professional tax, KRR loan
Be concise, practical, and alert him to risks, patterns, and action items. Use INR formatting.`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
      body: JSON.stringify({
        model:"claude-haiku-4-5-20251001",
        max_tokens:600,
        system: systemPrompt,
        messages:[{role:"user", content:`Here is my tracker data:\n\n${summary}\n\nQuestion: ${question||"Give me key insights, what needs urgent attention, and what payments are overdue or pending?"}`}]
      })
    });
    const d = await r.json();
    const text = d.content?.[0]?.text || "Could not generate insight.";
    return {statusCode:200,headers:h,body:JSON.stringify({insight:text})};
  } catch(e) {return {statusCode:500,headers:h,body:JSON.stringify({error:e.message})};}
};
