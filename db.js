const DB_NAME="lightfixDB";
let db;

function initDB(){
  return new Promise((resolve)=>{
    const request=indexedDB.open(DB_NAME,2);

    request.onupgradeneeded=e=>{
      db=e.target.result;
      if(!db.objectStoreNames.contains("issues"))
        db.createObjectStore("issues",{keyPath:"id"});
      if(!db.objectStoreNames.contains("activity"))
        db.createObjectStore("activity",{autoIncrement:true});
    };

    request.onsuccess=e=>{
      db=e.target.result;
      resolve();
    };
  });
}

function logActivity(text){
  const tx=db.transaction("activity","readwrite");
  tx.objectStore("activity").add({
    text,
    time:new Date().toISOString()
  });
}

async function saveIssue(issue){
  issue.updatedAt=new Date().toISOString();
  issue.version=(issue.version||0)+1;

  const tx=db.transaction("issues","readwrite");
  tx.objectStore("issues").put(issue);
  logActivity("Saved issue: "+issue.issue);
}

async function deleteIssue(id){
  const tx=db.transaction("issues","readwrite");
  tx.objectStore("issues").delete(id);
  logActivity("Deleted issue");
}

function getAllIssues(){
  return new Promise(resolve=>{
    const tx=db.transaction("issues","readonly");
    const req=tx.objectStore("issues").getAll();
    req.onsuccess=()=>resolve(req.result);
  });
}

function getActivity(){
  return new Promise(resolve=>{
    const tx=db.transaction("activity","readonly");
    const req=tx.objectStore("activity").getAll();
    req.onsuccess=()=>resolve(req.result);
  });
}

initDB();
