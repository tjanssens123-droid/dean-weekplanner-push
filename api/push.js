const webpush=require('web-push');

module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method not allowed'});

  try{
    const privateKey=process.env.VAPID_PRIVATE_KEY;
    const publicKey='BGT3el97fqi3X4j9ED_4lCoZG4zYM7znovqKecEfhoB_RMPVK0KqeBqM_Ck1_lqMwSE77N9EKBhvSE0ZghpT8CQ';

    if(!privateKey){
      return res.status(503).json({error:'VAPID_PRIVATE_KEY ontbreekt in Vercel'});
    }

    webpush.setVapidDetails('mailto:notifications@example.com',publicKey,privateKey);

    const {subscription,title,body,url}=req.body||{};
    if(!subscription?.endpoint){
      return res.status(400).json({error:'geen geldige ontvanger'});
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({title,body,url:url||'/'})
    );

    return res.status(200).json({ok:true});
  }catch(e){
    return res.status(e.statusCode||500).json({error:e.message||'push mislukt'});
  }
};