const webpush=require('web-push');

const SUPABASE_URL='https://kfrruzezmdiaoekucmnl.supabase.co';
const SUPABASE_KEY='sb_publishable_4Mx8mLcyFuwbLezyqYVZLA_lO8_zsTe';
const VAPID_PUBLIC_KEY='BBtMg90-ouJN-M5Hobgj73W8b2hZGVG4GKMd321J5hCN0AAMf1aqWPn3JZgX6zGXrjXDxGqH-T1qkoeWnBXUSOg';

async function rpc(name, body){
  const r=await fetch(SUPABASE_URL+'/rest/v1/rpc/'+name,{
    method:'POST',
    headers:{apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify(body||{})
  });
  if(!r.ok) throw new Error(await r.text());
  const t=await r.text(); return t?JSON.parse(t):null;
}

module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method not allowed'});
  try{
    const privateKey=process.env.VAPID_PRIVATE_KEY;
    if(!privateKey) return res.status(503).json({error:'push secret ontbreekt'});
    const {title='Mijn Golfweek',body='Nieuwe melding',url='/',deviceToken}=req.body||{};
    if(!deviceToken) return res.status(401).json({error:'niet ingelogd'});

    const member=await rpc('get_member_session',{p_device_token:deviceToken});
    if(!member||!member[0]||!member[0].active) return res.status(401).json({error:'geen toegang'});

    webpush.setVapidDetails('mailto:notifications@example.com',VAPID_PUBLIC_KEY,privateKey);
    const subscriptions=await rpc('get_active_push_subscriptions',{p_secret:privateKey});

    let sent=0;
    for(const s of subscriptions||[]){
      try{
        await webpush.sendNotification(
          {endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},
          JSON.stringify({title,body,url})
        );
        sent++;
      }catch(e){
        if(e.statusCode!==404&&e.statusCode!==410) console.error(e);
      }
    }
    return res.status(200).json({ok:true,sent});
  }catch(e){
    return res.status(500).json({error:'push mislukt'});
  }
};