'use strict';
const http = require('http');
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const SYSTEM = `너는 OFF THE RECORD(OTR)의 공식 카카오톡 채널 매니저 OTR MANAGER다. 한국어로 친근하고 짧게 답해. 중랑구·동대문구·광진구·성동구 중심의 20~30대 친목 커뮤니티다. 매너와 사생활 존중을 강조해. 실제 모임 일정, 가입 조건, 운영 정책은 확인된 정보가 없으면 지어내지 말고 방장 공지를 확인하도록 안내해. 회원의 개인정보를 요구하거나 저장하지 마. 네가 AI 챗봇이라는 사실을 숨기지 마. 답변은 보통 1~3문장으로, 이모지는 적당히 사용해.`;
const FAQ = [
 {words:['규칙','매너','주의'],answer:'🖤 OTR 기본 규칙! 서로 존중하고, 불편한 언행·무리한 개인 연락은 피해줘. 자세한 운영 규칙은 방장 공지를 확인해 줘 😎'},
 {words:['지역','어디','동네'],answer:'📍 OTR은 중랑·동대문·광진·성동을 중심으로 친해지는 커뮤니티야!'},
 {words:['모임','정모','번개','오프라인'],answer:'☕ 오프라인 모임 일정은 방장 공지를 확인해 줘. 확정되지 않은 일정은 내가 임의로 안내하지 않을게!'},
 {words:['출석','안녕','하이','반가워'],answer:'🙋 반가워! OTR MANAGER야. 오늘 하루 어땠어? 편하게 얘기해 줘 🖤'},
 {words:['소개','otr','오티알'],answer:'🖤 OFF THE RECORD는 중랑·동대문·광진·성동 중심의 20~30대 친목 커뮤니티야. 편하게 수다 떨고 좋은 인연을 만들어 봐!'}
];
function kakao(text){return {version:'2.0',template:{outputs:[{simpleText:{text:text.slice(0,990)}}]}};}
function replyFor(text){const s=text.toLowerCase();return FAQ.find(f=>f.words.some(w=>s.includes(w)))?.answer;}
async function aiReply(message){
 if(!API_KEY) return '🤖 OTR MANAGER 준비 중이야! 지금은 규칙·지역·모임·출석·소개를 물어보면 안내해 줄 수 있어 🖤 AI 대화를 켜려면 서버에 API 키를 설정해야 해.';
 const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),3500);
 try{
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${API_KEY}`},body:JSON.stringify({model:MODEL,messages:[{role:'system',content:SYSTEM},{role:'user',content:message}],max_tokens:180,temperature:0.7}),signal:controller.signal});
  if(!response.ok) throw new Error(`AI HTTP ${response.status}`);
  const json=await response.json();return json.choices?.[0]?.message?.content?.trim() || '잠깐만! 다시 한 번 말해 줄래? 🖤';
 }catch(e){console.error('AI response unavailable:',e.message);return '지금은 답변이 조금 늦어지고 있어 🥹 잠시 후 다시 말 걸어줘!';}
 finally{clearTimeout(timer);}
}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');
 if(req.method==='GET'&&req.url==='/health'){res.writeHead(200);res.end(JSON.stringify({ok:true,service:'OTR MANAGER'}));return;}
 if(req.method!=='POST'||req.url!=='/skill'){res.writeHead(404);res.end(JSON.stringify({error:'Not found'}));return;}
 let raw='';try{for await(const chunk of req){raw+=chunk;if(raw.length>100000)throw new Error('Too large');}const body=JSON.parse(raw);const utterance=String(body.userRequest?.utterance||'').trim().slice(0,1000);const text=replyFor(utterance)||await aiReply(utterance);res.writeHead(200);res.end(JSON.stringify(kakao(text)));}catch(e){console.error(e.message);res.writeHead(200);res.end(JSON.stringify(kakao('요청을 이해하지 못했어. 다시 한 번 말해 줄래? 🖤')));}
});
server.listen(PORT,'0.0.0.0',()=>console.log(`OTR MANAGER listening on ${PORT}`));
