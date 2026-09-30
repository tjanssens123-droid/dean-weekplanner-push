const webpush=require('web-push');

const SUPABASE_URL='https://kfrruzezmdiaoekucmnl.supabase.co';
const SUPABASE_KEY='sb_publishable_4Mx8mLcyFuwbLezyqYVZLA_lO8_zsTe';
const VAPID_PUBLIC_KEY='BBtMg90-ouJN-M5Hobgj73W8b2hZGVG4GKMd321J5hCN0AAMf1aqWPn3JZgX6zGXrjXDxGqH-T1qkoeWnBXUSOg';

module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method not allowed'});

  try{
    const privateKey=process.env.VAPID_PRIVATE_KEY;
    if(!privateKey) return res.status(503).json({error:'VAPID_PRIVATE_KEY ontbreekt in Vercel'});

    webpush.setVapidDetails('mailto:notifications@example.com',VAPID_PUBLIC_KEY,privateKey);

    const rpc=await fetch(SUPABASE_URL+'/rest/v1/rpc/get_push_subscriptions',{
      method:'POST',
      headers:{
        'apikey':SUPABASE_KEY,
        'Authorization':'Bearer '+SUPABASE_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({p_secret:privateKey})
    });

    if(!rpc.ok){
      const t=await rpc.text();
      throw new Error('kon aangemelde telefoons niet ophalen: '+t);
    }

    const subscriptions=await rpc.json();
    const {title='Dean Weekplanner',body='nieuwe melding',url='/'}=req.body||{};

    let sent=0;
    for(const s of subscriptions){
      try{
        await webpush.sendNotification(
          {endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}},
          JSON.stringify({title,body,url})
        );
        sent++;
      }catch(e){
        if(e.statusCode!==404 && e.statusCode!==410) console.error(e);
      }
    }

    return res.status(200).json({ok:true,sent});
  }catch(e){
    return res.status(500).json({error:e.message||'push mislukt'});
  }
};