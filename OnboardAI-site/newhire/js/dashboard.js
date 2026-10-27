const defaultTasks = [
 {id:1,title:"Đọc nội quy công ty",description:"Tìm hiểu văn hóa, quy định và nội quy làm việc tại công ty.",due:"26/10/2026",completed:true},
 {id:2,title:"Hoàn thiện hồ sơ nhân sự",description:"Điền thông tin và chuẩn bị giấy tờ cần thiết.",due:"27/10/2026",completed:true},
 {id:3,title:"Tham gia buổi định hướng",description:"Tìm hiểu công ty, sản phẩm và quy trình làm việc.",due:"28/10/2026",completed:false},
 {id:4,title:"Tìm hiểu quy trình làm việc",description:"Đọc tài liệu và làm quen với công cụ của nhóm.",due:"30/10/2026",completed:false},
 {id:5,title:"Gặp mentor / quản lý trực tiếp",description:"Trao đổi về mục tiêu và cách phối hợp.",due:"31/10/2026",completed:false}
];
function getTasks(){try{return JSON.parse(localStorage.getItem("onboardai-checklist-tasks"))||defaultTasks}catch{return defaultTasks}}
const tasks=getTasks(), completed=tasks.filter(t=>t.completed).length, total=tasks.length, percent=total?Math.round(completed/total*100):0;
document.getElementById("completedCount").textContent=completed; document.getElementById("totalCount").textContent=total; document.getElementById("progressPercent").textContent=percent+"%"; document.getElementById("progressFill").style.width=percent+"%"; document.getElementById("progressRing").style.background=`conic-gradient(var(--purple) ${percent}%, #eeeef7 0)`; document.getElementById("progressBar").setAttribute("aria-valuenow",percent); document.getElementById("doneStat").textContent=completed; document.getElementById("pendingStat").textContent=total-completed;
const list=document.getElementById("upcomingList"); const upcoming=tasks.filter(t=>!t.completed).slice(0,3); list.innerHTML=upcoming.length?upcoming.map(t=>`<article class="task-card"><div class="task-icon">☷</div><div class="task-details"><h3>${t.title}</h3><p>${t.description}</p><span class="task-due">Hạn hoàn thành: ${t.due}</span></div><span class="status-pill">Đang chờ</span></article>`).join(""):'<p class="empty-state">Bạn đã hoàn thành tất cả nhiệm vụ mẫu.</p>';
document.getElementById("menuButton").addEventListener("click",()=>{const sidebar=document.getElementById("sidebar");const open=sidebar.classList.toggle("open");document.getElementById("menuButton").setAttribute("aria-expanded",String(open));});
