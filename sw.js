self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{}
  event.waitUntil(self.registration.showNotification(data.title||'Dean Weekplanner',{
    body:data.body||'je hebt een nieuwe melding',
    icon:'/icon.svg',
    badge:'/icon.svg',
    data:{url:data.url||'/'}
  }));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||'/';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
    if(windows.length){
      await windows[0].focus();
      return windows[0].navigate(url);
    }
    return clients.openWindow(url);
  }));
});