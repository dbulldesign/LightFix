const issueList=document.getElementById('issueList');
const issueModal=document.getElementById('issueModal');
const filterDrawer=document.getElementById('filterDrawer');
const tagFilterList=document.getElementById('tagFilterList');

let editingIssue=null;
let activeTagFilter=null;

/* RENDER */

async function renderUI(){
  const issues=await getAllIssues();
  issueList.innerHTML='';

  let filtered=issues;

  if(activeTagFilter){
    filtered=filtered.filter(i=>i.tags?.includes(activeTagFilter));
  }

  filtered.sort((a,b)=>(a.order||0)-(b.order||0));

  filtered.forEach(issue=>{
    const card=document.createElement('div');
    card.className='card';
    card.draggable=true;
    card.dataset.id=issue.id;

    card.innerHTML=`
      <div><strong>${issue.issue}</strong></div>
      <div>${issue.date||''}</div>
      <div class="tags">
        ${(issue.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}
      </div>
    `;

    // Inline edit
    card.onclick=()=>{
      editingIssue=issue;
      issueText.value=issue.issue;
      issueDate.value=issue.date||"";
      issueTags.value=(issue.tags||[]).join(",");
      modalTitle.textContent="Edit Issue";
      issueModal.classList.add('open');
    };

    // Drag
    card.addEventListener('dragstart',()=>{
      card.classList.add('dragging');
    });

    card.addEventListener('dragend',()=>{
      card.classList.remove('dragging');
      updateOrder();
    });

    issueList.appendChild(card);
  });

  buildTagFilters(issues);
}

/* DRAG REORDER */

function updateOrder(){
  const cards=[...document.querySelectorAll('.card')];
  cards.forEach((card,index)=>{
    const id=card.dataset.id;
    getAllIssues().then(issues=>{
      const issue=issues.find(i=>i.id===id);
      issue.order=index;
      saveIssue(issue);
    });
  });
}

/* FILTERS */

function buildTagFilters(issues){
  const tags=[...new Set(issues.flatMap(i=>i.tags||[]))];
  tagFilterList.innerHTML='';
  tags.forEach(tag=>{
    const btn=document.createElement('button');
    btn.textContent=tag;
    btn.onclick=()=>{
      activeTagFilter=tag;
      filterDrawer.classList.remove('open');
      renderUI();
    };
    tagFilterList.appendChild(btn);
  });
}

filterBtn.onclick=()=>filterDrawer.classList.toggle('open');

/* SAVE */

saveIssueBtn.onclick=async()=>{
  const issue={
    id:editingIssue?editingIssue.id:crypto.randomUUID(),
    issue:issueText.value,
    date:issueDate.value,
    tags:issueTags.value.split(',').map(t=>t.trim()).filter(Boolean),
    order:editingIssue?.order||Date.now()
  };

  await saveIssue(issue);
  editingIssue=null;
  issueModal.classList.remove('open');
  renderUI();
};

addBtn.onclick=()=>{
  editingIssue=null;
  issueText.value="";
  issueDate.value="";
  issueTags.value="";
  modalTitle.textContent="New Issue";
  issueModal.classList.add('open');
};

/* ACTIVITY LOG */

async function renderActivity(){
  const activity=await getActivity();
  const div=document.createElement('div');
  div.className='timeline';
  div.innerHTML=activity.slice(-10).reverse()
    .map(a=>`<div>${a.text} — ${new Date(a.time).toLocaleString()}</div>`)
    .join("");
  document.body.appendChild(div);
}

renderUI();
renderActivity();
