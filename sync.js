const API_URL=https://script.google.com/macros/s/AKfycbxzDks6rG9zfseFRjfbN75Php-xg-YKKgIEFUFIBBkMNKZ0U-dRZ0Czl_9mDZzbHb3Z/exec;

async function sync(){
  const localIssues=await getAllIssues();

  const res=await fetch(API_URL,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      action:"sync",
      issues:localIssues
    })
  });

  const data=await res.json();

  for(const remote of data.issues){
    const local=localIssues.find(i=>i.id===remote.id);

    if(!local){
      await saveIssue(remote);
      continue;
    }

    if(remote.version>local.version){
      await saveIssue(remote);
    }
  }
}
