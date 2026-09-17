(function(){

  // ---------- Theme toggle (manual override of prefers-color-scheme) ----------
  const themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    if(current === 'light'){ root.setAttribute('data-theme','dark'); }
    else if(current === 'dark'){ root.removeAttribute('data-theme'); }
    else { root.setAttribute('data-theme','light'); }
  });

  // ---------- Seed data (global, to show this isn't a single-country tool) ----------
  const SEED = [
    {id:'s1', area:'MM Alam Road footbridge', city:'Lahore, Pakistan', x:18, y:24, level:'caution', time:'night', reasons:['No lighting','Isolated'], note:'Fine in the evening rush, feels empty after 10pm.', votes:14},
    {id:'s2', area:'Liberty roundabout', city:'Lahore, Pakistan', x:30, y:55, level:'safe', time:'both', reasons:['Well lit','Busy / crowded'], note:'Always people around, decent lighting.', votes:22},
    {id:'s3', area:'Kibera footpath, Kianda', city:'Nairobi, Kenya', x:55, y:20, level:'unsafe', time:'night', reasons:['No lighting','Harassment reported'], note:'Locals reroute after dark.', votes:31},
    {id:'s4', area:'Rua Augusta underpass', city:'São Paulo, Brazil', x:70, y:62, level:'caution', time:'night', reasons:['Isolated','No footpath'], note:'Busy by day, quiet and dark by night.', votes:9},
    {id:'s5', area:'Rizal Park promenade', city:'Manila, Philippines', x:82, y:30, level:'safe', time:'both', reasons:['Good CCTV','Busy / crowded'], note:'Patrolled and well used at all hours.', votes:17},
    {id:'s6', area:'Camden underpass', city:'London, UK', x:40, y:70, level:'unsafe', time:'night', reasons:['No lighting','Harassment reported'], note:'Multiple reports of catcalling after dark.', votes:26},
    {id:'s7', area:'Jinnah Super market lane', city:'Islamabad, Pakistan', x:12, y:60, level:'safe', time:'both', reasons:['Well lit','Busy / crowded'], note:'Shops open late keep it lively.', votes:11},
  ];

  const STORAGE_KEY = 'saferoute_user_reports_v1';
  const VOTES_KEY = 'saferoute_votes_v1';

  function loadUserReports(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function saveUserReports(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }catch(e){}
  }
  function loadVoteOverrides(){
    try{
      const raw = localStorage.getItem(VOTES_KEY);
      return raw ? JSON.parse(raw) : {};
    }catch(e){ return {}; }
  }
  function saveVoteOverrides(obj){
    try{ localStorage.setItem(VOTES_KEY, JSON.stringify(obj)); }catch(e){}
  }

  let userReports = loadUserReports();
  let voteOverrides = loadVoteOverrides();

  function allReports(){
    return [...SEED, ...userReports].map(r => {
      if(voteOverrides[r.id]) return {...r, votes: r.votes + voteOverrides[r.id]};
      return r;
    });
  }

  // ---------- State ----------
  let activeLevel = 'all';
  let activeTime = 'all';
  let searchTerm = '';
  let pickedPoint = null;
  let pickedLevel = null;
  let pickedReasons = new Set();

  const mapSvg = document.getElementById('cityMap');
  const mapWrap = document.getElementById('mapWrap');
  const reportList = document.getElementById('reportList');
  const visibleCount = document.getElementById('visibleCount');
  const toast = document.getElementById('toast');

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(()=> toast.classList.remove('show'), 2200);
  }

  function colorFor(level){
    return level === 'safe' ? 'var(--green)' : level === 'caution' ? 'var(--amber)' : 'var(--coral)';
  }

  function filteredReports(){
    return allReports().filter(r => {
      if(activeLevel !== 'all' && r.level !== activeLevel) return false;
      if(activeTime !== 'all' && r.time !== 'both' && r.time !== activeTime) return false;
      if(searchTerm){
        const hay = (r.area + ' ' + r.city).toLowerCase();
        if(!hay.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }

  // ---------- Draw static city-block backdrop once ----------
  function drawBackdrop(){
    const ns = 'http://www.w3.org/2000/svg';
    const bg = document.createElementNS(ns,'g');
    bg.setAttribute('id','backdrop');
    const rows = [16, 34, 50, 66];
    const cols = [14, 30, 48, 64, 80, 92];
    rows.forEach(y=>{
      const l = document.createElementNS(ns,'line');
      l.setAttribute('x1','0'); l.setAttribute('x2','100');
      l.setAttribute('y1',y); l.setAttribute('y2',y);
      l.setAttribute('stroke','var(--line)'); l.setAttribute('stroke-width','0.4');
      bg.appendChild(l);
    });
    cols.forEach(x=>{
      const l = document.createElementNS(ns,'line');
      l.setAttribute('y1','0'); l.setAttribute('y2','82');
      l.setAttribute('x1',x); l.setAttribute('x2',x);
      l.setAttribute('stroke','var(--line)'); l.setAttribute('stroke-width','0.4');
      bg.appendChild(l);
    });
    mapSvg.appendChild(bg);
  }

  const pinLayer = (function(){
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns,'g');
    g.setAttribute('id','pinLayer');
    mapSvg.appendChild(g);
    return g;
  })();

  const pickLayer = (function(){
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns,'g');
    g.setAttribute('id','pickLayer');
    mapSvg.appendChild(g);
    return g;
  })();

  let activeDetailId = null;

  function renderMap(){
    const ns = 'http://www.w3.org/2000/svg';
    pinLayer.innerHTML = '';
    const list = filteredReports();
    visibleCount.textContent = list.length;

    list.forEach(r => {
      const c = document.createElementNS(ns,'circle');
      c.setAttribute('cx', r.x * 100/100);
      c.setAttribute('cy', r.y * 82/100);
      c.setAttribute('r', activeDetailId === r.id ? 2.6 : 1.9);
      c.setAttribute('fill', colorFor(r.level));
      c.setAttribute('stroke', 'var(--bg)');
      c.setAttribute('stroke-width', '0.5');
      c.style.cursor = 'pointer';
      c.addEventListener('click', (e)=>{ e.stopPropagation(); showDetail(r.id); });
      pinLayer.appendChild(c);

      if(activeDetailId === r.id){
        const ring = document.createElementNS(ns,'circle');
        ring.setAttribute('cx', r.x); ring.setAttribute('cy', r.y * 82/100);
        ring.setAttribute('r', 4.2);
        ring.setAttribute('fill','none');
        ring.setAttribute('stroke', colorFor(r.level));
        ring.setAttribute('stroke-width','0.4');
        ring.setAttribute('opacity','0.6');
        pinLayer.appendChild(ring);
      }
    });
  }

  function showDetail(id){
    activeDetailId = (activeDetailId === id) ? null : id;
    renderMap();
    renderList();
    if(activeDetailId){
      const card = document.querySelector('[data-card-id="'+CSS.escape(activeDetailId)+'"]');
      if(card) card.scrollIntoView({behavior:'smooth', block:'nearest'});
    }
  }

  function renderList(){
    const list = filteredReports();
    reportList.innerHTML = '';
    if(list.length === 0){
      reportList.innerHTML = '<div class="empty-note">No reports match these filters yet.</div>';
      return;
    }
    list.forEach(r => {
      const card = document.createElement('div');
      card.className = 'report-card';
      card.setAttribute('data-card-id', r.id);
      if(activeDetailId === r.id){ card.style.borderColor = colorFor(r.level); }
      const timeLabel = r.time === 'both' ? 'Day & night' : r.time === 'day' ? 'Daytime' : 'Nighttime';
      card.innerHTML = `
        <div class="top">
          <div>
            <div class="area">${escapeHtml(r.area)}</div>
            <div class="city">${escapeHtml(r.city)}</div>
          </div>
          <span class="badge ${r.level}">${r.level}</span>
        </div>
        <div class="note">${escapeHtml(r.note || '')}</div>
        <div class="tags">${r.reasons.map(t=>'<span>'+escapeHtml(t)+'</span>').join('')}<span>${timeLabel}</span></div>
        <div class="meta">
          <span>${r.votes} people confirmed this</span>
          <button class="confirm-btn" data-confirm="${r.id}">＋ Confirm</button>
        </div>
      `;
      card.addEventListener('click', (e)=>{
        if(e.target.closest('[data-confirm]')) return;
        showDetail(r.id);
      });
      reportList.appendChild(card);
    });

    reportList.querySelectorAll('[data-confirm]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const id = btn.getAttribute('data-confirm');
        voteOverrides[id] = (voteOverrides[id] || 0) + 1;
        saveVoteOverrides(voteOverrides);
        renderList();
        showToast('Thanks — confirmation added');
      });
    });
  }

  function escapeHtml(str){
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ---------- Filters ----------
  document.getElementById('levelFilters').addEventListener('click', (e)=>{
    const btn = e.target.closest('.chip');
    if(!btn) return;
    document.querySelectorAll('#levelFilters .chip').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    activeLevel = btn.getAttribute('data-level');
    renderMap(); renderList();
  });

  document.getElementById('timeToggle').addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    document.querySelectorAll('#timeToggle button').forEach(c=>c.classList.remove('active'));
    btn.classList.add('active');
    activeTime = btn.getAttribute('data-time');
    renderMap(); renderList();
  });

  document.getElementById('searchInput').addEventListener('input', (e)=>{
    searchTerm = e.target.value;
    renderMap(); renderList();
  });

  // ---------- Click map to pick a point ----------
  const pinStatus = document.getElementById('pinStatus');
  const submitBtn = document.getElementById('submitBtn');

  mapWrap.addEventListener('click', (e)=>{
    const rect = mapWrap.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    pickedPoint = {x: Math.max(2,Math.min(98,x)), y: Math.max(2,Math.min(98,y))};

    const ns = 'http://www.w3.org/2000/svg';
    pickLayer.innerHTML = '';
    const c = document.createElementNS(ns,'circle');
    c.setAttribute('cx', pickedPoint.x);
    c.setAttribute('cy', pickedPoint.y * 82/100);
    c.setAttribute('r', 2.4);
    c.setAttribute('fill','none');
    c.setAttribute('stroke','var(--fg)');
    c.setAttribute('stroke-width','0.6');
    c.setAttribute('stroke-dasharray','1.4 1');
    pickLayer.appendChild(c);

    pinStatus.textContent = 'Location selected — describe it in the form below.';
    pinStatus.classList.add('picked');
    updateSubmitState();
  });

  // ---------- Level picker ----------
  document.getElementById('levelPicker').addEventListener('click', (e)=>{
    const btn = e.target.closest('.level-btn');
    if(!btn) return;
    document.querySelectorAll('.level-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    pickedLevel = btn.getAttribute('data-level');
    updateSubmitState();
  });

  // ---------- Reason chips ----------
  document.getElementById('reasonGrid').addEventListener('click', (e)=>{
    const btn = e.target.closest('.reason-chip');
    if(!btn) return;
    const reason = btn.getAttribute('data-reason');
    if(pickedReasons.has(reason)){ pickedReasons.delete(reason); btn.classList.remove('active'); }
    else{ pickedReasons.add(reason); btn.classList.add('active'); }
  });

  function updateSubmitState(){
    submitBtn.disabled = !(pickedPoint && pickedLevel);
  }

  // ---------- Submit ----------
  document.getElementById('reportForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!pickedPoint || !pickedLevel) return;

    const area = document.getElementById('areaName').value.trim();
    const city = document.getElementById('cityName').value.trim();
    const time = document.getElementById('timeSelect').value;
    const note = document.getElementById('note').value.trim();

    const newReport = {
      id: 'u_' + Date.now(),
      area, city,
      x: pickedPoint.x, y: pickedPoint.y,
      level: pickedLevel,
      time,
      reasons: Array.from(pickedReasons),
      note,
      votes: 1
    };

    userReports.push(newReport);
    saveUserReports(userReports);

    // reset form
    e.target.reset();
    pickedPoint = null; pickedLevel = null; pickedReasons = new Set();
    document.querySelectorAll('.level-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.reason-chip').forEach(b=>b.classList.remove('active'));
    pickLayer.innerHTML = '';
    pinStatus.textContent = 'No location selected yet — tap the map.';
    pinStatus.classList.remove('picked');
    updateSubmitState();

    renderMap(); renderList();
    showToast('Pin added to the map');
  });

  // ---------- Init ----------
  drawBackdrop();
  renderMap();
  renderList();

})();