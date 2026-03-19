// ════════════════════════════════════════
//  SABİTLER
// ════════════════════════════════════════
const DAILY_GOAL = 10;
const LS_LEARNED = "m1_learned";
const LS_FAV     = "m1_fav";
const LS_DATE    = "m1_today_date";
const LS_COUNT   = "m1_today_count";

const K_WORT  = "Wort";
const K_GRAMM = "Grammatik\n(Artikel/Konjugation)";
const K_SENT  = "Beispiel Satz";
const K_KAPI  = "Kapitel";
const K_TEIL  = "Teil";
const K_AUDIO = "ses_dosyasi";
const K_AUDIO2= "Audio Datei";

// ════════════════════════════════════════
//  DURUM
// ════════════════════════════════════════
let m1All       = [];
let m1Vocab     = [];   // karte_datum <= bugün
let m1AudioList = [];   // audio_datum <= bugün
let m1Session   = [];
let m1Index     = 0;
let m1Mode      = "flash";
let learnedSet  = new Set();
let favSet      = new Set();
let todayCount  = 0;
let listenSession = [];
let listenIndex   = 0;

const M2C   = { lesson:"Lektion", de:"Deutsch", sentence:"Beispiel Satz" };
const LANGS = ["Turkisch","Englisch","Ukrainisch (Українська)","Arabisch (العربية)","Farsi (فارسی)","Kurdisch (Kurmancî)"];
let m2Vocab=[], m2Session=[], m2Index=0, m2Mode="flash";
let m2Lang="Turkisch", m2LangFlag="🇹🇷", m2LangName="Türkçe";
let m2LearnedSet=new Set(), m2FavSet=new Set(), m2Stats={correct:0,wrong:0};

// ════════════════════════════════════════
//  LOCAL STORAGE
// ════════════════════════════════════════
function lsGet(k)  { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function lsSet(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function loadLS() {
  learnedSet = new Set(lsGet(LS_LEARNED) || []);
  favSet     = new Set(lsGet(LS_FAV)     || []);
  const today = new Date().toDateString();
  if (lsGet(LS_DATE) !== today) { lsSet(LS_DATE, today); lsSet(LS_COUNT, 0); todayCount = 0; }
  else todayCount = lsGet(LS_COUNT) || 0;
}
function saveLS() {
  lsSet(LS_LEARNED, [...learnedSet]);
  lsSet(LS_FAV,     [...favSet]);
  lsSet(LS_COUNT,   todayCount);
}

// ════════════════════════════════════════
//  YÜKLEME
// ════════════════════════════════════════
async function loadModul1() {
  try {
    const res = await fetch("modul1.json", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    m1All = await res.json();
    loadLS();

    const _now = new Date();
    const _todayUTC = Date.UTC(_now.getUTCFullYear(), _now.getUTCMonth(), _now.getUTCDate());

    m1All.forEach(r => {
      r._audioReady = typeof r["audio_datum"] === "number" && r["audio_datum"] <= _todayUTC;
      r._karteReady = typeof r["karte_datum"] === "number" && r["karte_datum"] <= _todayUTC;
    });

    m1AudioList = m1All.filter(r => r._audioReady === true);
    m1Vocab     = m1All.filter(r => r._karteReady === true);

    const allK = [...new Set(m1All.map(r=>r[K_KAPI]).filter(Boolean))].sort((a,b)=>a-b);
    const openK= [...new Set(m1Vocab.map(r=>r[K_KAPI]).filter(Boolean))].sort((a,b)=>a-b);

    setText("m1-words-display", m1Vocab.length + " Karten · " + m1AudioList.length + " Audio");
    setText("m1-kapitel-info",  openK.length + " von " + allK.length + " Kapitel");
    const btn = document.getElementById("m1-btn");
    if (btn) { btn.innerText = "Starten →"; btn.disabled = false; }

    buildM1Menu();
    buildListenMenu();
  } catch(e) {
    console.error("Modul1:", e);
    setText("m1-words-display", "Ladefehler!");
  }
}

async function loadModul2() {
  try {
    const res = await fetch("sicher.csv", { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    let txt = await res.text();
    if (txt.charCodeAt(0) === 0xFEFF) txt = txt.slice(1);
    const p = Papa.parse(txt, { header:true, skipEmptyLines:true, dynamicTyping:false });
    m2Vocab = (p.data||[]).map(normM2).filter(r=>r&&r[M2C.de]&&r[M2C.sentence]);
    setText("m2-words-display", m2Vocab.length + " Wörter bereit");
    const btn = document.getElementById("m2-btn");
    if (btn) { btn.innerText = "Starten →"; btn.disabled = false; }
    buildM2Menu();
  } catch(e) {
    console.error("Modul2:", e);
    setText("m2-words-display", "CSV Fehler!");
  }
}

function normM2(row) {
  const c = {};
  for (const k in row) {
    const key = (k||"").replace(/^\uFEFF/,"").trim();
    c[key] = typeof row[k]==="string" ? row[k].replace(/\u00A0/g," ").trim() : row[k];
  }
  const n = parseInt(String(c[M2C.lesson]||"").trim(),10);
  c[M2C.lesson] = isFinite(n) ? n : null;
  LANGS.forEach(l=>{ if(typeof c[l]==="string") c[l]=c[l].trim(); });
  return c;
}

// ════════════════════════════════════════
//  MENÜ İNŞA
// ════════════════════════════════════════
function buildM1Menu() {
  const ks = [...new Set(m1Vocab.map(r=>r[K_KAPI]).filter(Boolean))].sort((a,b)=>a-b);
  const su = document.getElementById("f-unit");
  if (su) {
    su.innerHTML = `<option value="all">Alle</option>`;
    ks.forEach(k => { const o=document.createElement("option"); o.value=String(k); o.innerText="Kapitel "+k; su.appendChild(o); });
  }
  buildTeilMenu();
}

function buildTeilMenu() {
  const sp = document.getElementById("f-part"); if (!sp) return;
  const unit = val("f-unit");
  const filtered = unit==="all" ? m1Vocab : m1Vocab.filter(r=>String(r[K_KAPI])===unit);
  const teile = [...new Set(filtered.map(r=>r[K_TEIL]).filter(Boolean))].sort((a,b)=>a-b);
  sp.innerHTML = `<option value="all">Alle</option>`;
  teile.forEach(t => { const o=document.createElement("option"); o.value=String(t); o.innerText="Teil "+t; sp.appendChild(o); });
}

function buildListenMenu() {
  const ks = [...new Set(m1AudioList.map(r=>r[K_KAPI]).filter(Boolean))].sort((a,b)=>a-b);
  const su = document.getElementById("listen-unit");
  if (su) {
    su.innerHTML = `<option value="all">Alle Kapitel</option>`;
    ks.forEach(k => { const o=document.createElement("option"); o.value=String(k); o.innerText="Kapitel "+k; su.appendChild(o); });
  }
  buildListenTeilMenu();
}

function buildListenTeilMenu() {
  const sp = document.getElementById("listen-part"); if (!sp) return;
  const unit = val("listen-unit");
  const filtered = unit==="all" ? m1AudioList : m1AudioList.filter(r=>String(r[K_KAPI])===unit);
  const teile = [...new Set(filtered.map(r=>r[K_TEIL]).filter(Boolean))].sort((a,b)=>a-b);
  sp.innerHTML = `<option value="all">Alle Teile</option>`;
  teile.forEach(t => { const o=document.createElement("option"); o.value=String(t); o.innerText="Teil "+t; sp.appendChild(o); });
  initListenSession();
}

function buildM2Menu() {
  const s = document.getElementById("m2-unit"); if (!s) return;
  s.innerHTML = `<option value="all">Alle Lektionen</option>`;
  [...new Set(m2Vocab.map(v=>v[M2C.lesson]).filter(x=>isFinite(x)))].sort((a,b)=>a-b)
    .forEach(l => { const o=document.createElement("option"); o.value=String(l); o.innerText="Lektion "+l; s.appendChild(o); });
}

// ════════════════════════════════════════
//  NAVİGASYON
// ════════════════════════════════════════
function openTrainer(mod) {
  if (mod===1) {
    if (!m1Vocab.length && !m1AudioList.length) { alert("Modul 1 wird noch geladen."); return; }
    hide("page-menu"); show("page-m1"); hide("page-m2");
    m1Mode="flash"; syncTabs(); initSession();
  } else {
    hide("page-menu"); hide("page-m1"); show("page-m2");
    m2ShowLang();
  }
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
}

function showMenu() {
  const a = document.getElementById("m1-audio");
  if (a) { a.pause(); a.src=""; }
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  show("page-menu"); hide("page-m1"); hide("page-m2");
  setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
}

// ════════════════════════════════════════
//  DİNLEME MODU
// ════════════════════════════════════════
function initListenSession() {
  const unit = val("listen-unit");
  const part = val("listen-part");
  listenSession = m1AudioList.filter(r => {
    if (unit !== "all" && String(r[K_KAPI]) !== unit) return false;
    if (part !== "all" && String(r[K_TEIL]) !== part) return false;
    return true;
  });
  listenIndex = 0;
  renderListenCard();
}

function renderListenCard() {
  const el = document.getElementById("listen-card");
  const counter = document.getElementById("listen-counter");
  if (!el) return;

  if (!listenSession.length) {
    el.innerHTML = `<div class="listen-empty">Keine Audio-Dateien verfügbar.</div>`;
    if (counter) counter.innerText = "";
    return;
  }
  if (listenIndex >= listenSession.length) listenIndex = listenSession.length-1;
  if (listenIndex < 0) listenIndex = 0;

  const item = listenSession[listenIndex];
  const k = item[K_KAPI], t = item[K_TEIL];
  const badges = k ? `<span class="m1-badge">Kapitel ${k}</span><span class="m1-badge">Teil ${t||1}</span>` : "";

  el.innerHTML = `
    <div class="listen-word">${esc(item[K_WORT]||"")}</div>
    <div class="listen-badges">${badges}</div>
    <button class="m1-listen listen-play-btn" onclick="playOpus()">🔊 Anhören</button>
  `;
  if (counter) counter.innerText = (listenIndex+1) + " / " + listenSession.length;

  // Audio hazırla ama çalma
  const rawFile = item[K_AUDIO] || item[K_AUDIO2] || "";
  const file = rawFile ? (rawFile.startsWith("sesler/") || rawFile.startsWith("http") ? rawFile : "sesler/"+rawFile) : "";
  const audio = document.getElementById("m1-audio");
  if (audio && file) { audio.pause(); audio.src = file; audio.load(); }
}

function playOpus() {
  const item = listenSession[listenIndex]; if (!item) return;
  const rawFile = item[K_AUDIO] || item[K_AUDIO2] || "";
  const file = rawFile ? (rawFile.startsWith("sesler/") || rawFile.startsWith("http") ? rawFile : "sesler/"+rawFile) : "";
  if (!file) return;
  const audio = document.getElementById("m1-audio");
  audio.pause(); audio.src = file; audio.currentTime = 0;
  audio.onended = null; audio.onerror = null;
  audio.load(); audio.play().catch(() => {});
}

function listenNext() {
  listenIndex++;
  if (listenIndex >= listenSession.length) listenIndex = 0;
  renderListenCard();
}
function listenPrev() { if (listenIndex > 0) listenIndex--; renderListenCard(); }
function listenShuffle() { listenSession.sort(()=>Math.random()-.5); listenIndex=0; renderListenCard(); }

// ════════════════════════════════════════
//  KART OTURUMU
// ════════════════════════════════════════
function initSession() {
  const unit=val("f-unit"), part=val("f-part"), status=val("f-status");
  const search=(val("f-search")||"").toLowerCase().trim();
  let list = m1Vocab.filter(r => {
    if (unit!=="all" && String(r[K_KAPI])!==unit) return false;
    if (part!=="all" && String(r[K_TEIL])!==part) return false;
    return true;
  });
  if (status==="learned")   list=list.filter(r=> learnedSet.has(r[K_WORT]));
  if (status==="unlearned") list=list.filter(r=>!learnedSet.has(r[K_WORT]));
  if (status==="fav")       list=list.filter(r=> favSet.has(r[K_WORT]));
  if (search) list=list.filter(r=>(r[K_WORT]||"").toLowerCase().includes(search)||(r[K_SENT]||"").toLowerCase().includes(search));
  m1Session=list; m1Index=0;
  if (m1Mode==="review") { renderReview(); return; }
  renderCard();
}

function doShuffle() { m1Session.sort(()=>Math.random()-.5); m1Index=0; renderCard(); }
function doReset() {
  if (!confirm("Alle Fortschritte zurücksetzen?")) return;
  learnedSet.clear(); favSet.clear(); todayCount=0; saveLS(); initSession();
}
function doStats() {
  alert("📊 Statistik\n\nKarten: "+m1Vocab.length+"\nGelernt: "+learnedSet.size+
        "\nÜbrig: "+(m1Vocab.length-learnedSet.size)+"\nFavoriten: "+favSet.size+
        "\nHeute: "+todayCount+" / "+DAILY_GOAL+"\nAudio: "+m1AudioList.length);
}

// ════════════════════════════════════════
//  KART RENDER
// ════════════════════════════════════════
function renderCard() {
  updateStats();
  if (!m1Session.length) {
    setText("fc-word","Keine Wörter gefunden");
    setText("fc-grammar",""); setText("fc-sentence","");
    const b=document.getElementById("fc-badges"); if(b) b.innerHTML=""; return;
  }
  if (m1Index>=m1Session.length) m1Index=m1Session.length-1;
  if (m1Index<0) m1Index=0;
  const item=m1Session[m1Index];
  if (m1Mode==="flash") renderFlash(item);
  else if (m1Mode==="quiz") renderQuiz(item);
  else if (m1Mode==="write") renderWrite(item);
}

function renderFlash(item) {
  setText("fc-word",     item[K_WORT]||"");
  setText("fc-grammar",  item[K_GRAMM]||"");
  setText("fc-sentence", item[K_SENT]||"");
  const k=item[K_KAPI], t=item[K_TEIL];
  const b=document.getElementById("fc-badges");
  if (b) b.innerHTML = k ? `<span class="m1-badge">Lektion ${k}</span><span class="m1-badge">Teil ${t||1}</span>` : "";
  const fb=document.getElementById("fav-btn");
  if (fb) fb.textContent=favSet.has(item[K_WORT])?"★":"☆";
  // Ses elementini sıfırla — otomatik çalmasın
  const audio=document.getElementById("m1-audio");
  if (audio) { audio.pause(); audio.removeAttribute("src"); }
  document.getElementById("m1-card-inner")?.classList.remove("flipped");
}

function updateStats() {
  const total=m1Vocab.length, pct=Math.min(100,Math.round(todayCount/DAILY_GOAL*100));
  setText("s-total",total); setText("s-learned",learnedSet.size);
  setText("s-remaining",Math.max(0,total-learnedSet.size));
  setText("s-fav",favSet.size); setText("s-today",todayCount);
  const f=document.getElementById("s-fill"); if(f) f.style.width=pct+"%";
}

// ════════════════════════════════════════
//  KART AKSİYONLAR
// ════════════════════════════════════════
function doFlip() {
  // Sadece görsel çevir — ses çalmasın
  document.getElementById("m1-card-inner")?.classList.toggle("flipped");
}

// Sadece 🔊 butonuna basınca çağrılır — sadece TTS, opus yok
function doAudio() {
  const item=m1Session[m1Index]; if (!item) return;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const isFlipped=document.getElementById("m1-card-inner")?.classList.contains("flipped");
  if (isFlipped) {
    ttsSpeak([item[K_GRAMM]||"", item[K_SENT]||""].filter(Boolean));
  } else {
    ttsSpeak([item[K_WORT]||""].filter(Boolean));
  }
}

// ════════════════════════════════════════
//  TTS
// ════════════════════════════════════════
let _selectedVoice = null;
const PREFERRED = ["Karsten","Hedda","Katja","Stefan"];

function ttsSpeak(parts) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const list=parts.map(p=>(p||"").trim()).filter(Boolean);
  if (!list.length) return;
  const sel=document.getElementById("voice-select");
  if (sel&&sel.value) {
    const found=window.speechSynthesis.getVoices().find(v=>v.name===sel.value);
    if (found) _selectedVoice=found;
  }
  let idx=0;
  function next() {
    if (idx>=list.length) return;
    const u=new SpeechSynthesisUtterance(list[idx++]);
    if (_selectedVoice) { u.voice=_selectedVoice; u.lang=_selectedVoice.lang; } else { u.lang="de-DE"; }
    u.rate=0.9; u.pitch=1; u.volume=1; u.onend=next; u.onerror=next;
    window.speechSynthesis.speak(u);
  }
  next();
}

function tts(text) { if (text) ttsSpeak([text]); }

function populateVoiceSelect() {
  const sel=document.getElementById("voice-select"); if (!sel) return;
  const all=window.speechSynthesis.getVoices();
  const filtered=PREFERRED.map(name=>all.find(v=>v.name.includes(name)&&v.lang.startsWith("de"))).filter(Boolean);
  if (!filtered.length) return;
  sel.innerHTML="";
  filtered.forEach((v,i)=>{
    const o=document.createElement("option"); o.value=v.name;
    o.innerText=v.name.replace("Microsoft ","").replace(/ - German.*/,"");
    sel.appendChild(o); if(i===0) _selectedVoice=v;
  });
}
function setVoice(name) { _selectedVoice=window.speechSynthesis.getVoices().find(v=>v.name===name)||_selectedVoice; }

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged=populateVoiceSelect;
  setTimeout(populateVoiceSelect,200);
}

// ════════════════════════════════════════
//  KART NAVİGASYON
// ════════════════════════════════════════
function doLearned() {
  const item=m1Session[m1Index]; if (!item) return;
  const w=item[K_WORT];
  if (!learnedSet.has(w)) { learnedSet.add(w); todayCount++; saveLS(); }
  doNext();
}
function doFav() {
  const item=m1Session[m1Index]; if (!item) return;
  const w=item[K_WORT];
  favSet.has(w)?favSet.delete(w):favSet.add(w); saveLS();
  const fb=document.getElementById("fav-btn"); if(fb) fb.textContent=favSet.has(w)?"★":"☆";
  updateStats();
}
function doNext() {
  m1Index++;
  if (m1Index>=m1Session.length) { alert("🎉 Abschnitt beendet!"); m1Index=0; }
  renderCard();
}
function doPrev() { if(m1Index>0) m1Index--; renderCard(); }

// ════════════════════════════════════════
//  MULTIPLE CHOICE
// ════════════════════════════════════════
function renderQuiz(item) {
  const correct=item[K_WORT]||"";
  setText("q-question",item[K_SENT]||""); setText("q-meta","#"+(m1Index+1)+" / "+m1Session.length);
  const opts=[correct]; let g=0;
  while(opts.length<4&&g++<500){const r=m1Vocab[Math.floor(Math.random()*m1Vocab.length)][K_WORT];if(r&&!opts.includes(r))opts.push(r);}
  while(opts.length<4) opts.push("(keine Option)");
  opts.sort(()=>Math.random()-.5);
  const box=document.getElementById("q-opts"); box.innerHTML="";
  opts.forEach(opt=>{
    const btn=document.createElement("button"); btn.className="m1-opt"; btn.innerText=opt;
    btn.onclick=()=>{
      box.querySelectorAll("button").forEach(b=>b.disabled=true);
      if(opt===correct){btn.classList.add("c-ok");if(!learnedSet.has(correct)){learnedSet.add(correct);todayCount++;saveLS();}setTimeout(doNext,500);}
      else{btn.classList.add("c-err");box.querySelectorAll("button").forEach(b=>{if(b.innerText===correct)b.classList.add("c-ok");});setTimeout(doNext,700);}
      updateStats();
    };
    box.appendChild(btn);
  });
}

// ════════════════════════════════════════
//  SCHREIB-QUIZ
// ════════════════════════════════════════
function renderWrite(item) {
  setText("w-question",item[K_SENT]||""); setText("w-meta","#"+(m1Index+1)+" / "+m1Session.length);
  const inp=document.getElementById("w-input"); if(inp) inp.value="";
  const res=document.getElementById("w-result"); if(res){res.className="m1-wresult hidden";res.innerText="";}
}
function doCheck() {
  const item=m1Session[m1Index]; if(!item) return;
  const correct=(item[K_WORT]||"").toLowerCase().trim();
  const answer=(document.getElementById("w-input")?.value||"").toLowerCase().trim();
  const res=document.getElementById("w-result"); res.classList.remove("hidden");
  if(answer===correct){
    res.className="m1-wresult c-ok"; res.innerText="✅ Richtig!";
    if(!learnedSet.has(item[K_WORT])){learnedSet.add(item[K_WORT]);todayCount++;saveLS();}
    updateStats(); setTimeout(doNext,700);
  } else { res.className="m1-wresult c-err"; res.innerText="❌ Falsch – Richtig: "+item[K_WORT]; }
}

// ════════════════════════════════════════
//  WİEDERHOLUNG
// ════════════════════════════════════════
function renderReview() {
  const el=document.getElementById("review-content"); if(!el) return;
  const list=m1Vocab.filter(v=>!learnedSet.has(v[K_WORT]));
  if(!list.length){el.innerHTML=`<div class="rv-empty">🎉 Alle Wörter gelernt!</div>`;return;}
  el.innerHTML=list.map((v,i)=>{
    const w=esc(v[K_WORT]||""),s=esc(v[K_SENT]||"");
    return `<div class="rv-row"><span class="rv-num">${i+1}</span>
      <div class="rv-text"><strong>${w}</strong><span>${s}</span></div>
      <button class="rv-play" onclick="tts('${w.replace(/'/g,"\\'")}')">🔊</button></div>`;
  }).join("");
}

// ════════════════════════════════════════
//  MOD YÖNETİMİ
// ════════════════════════════════════════
function setMode(mode) {
  m1Mode=mode; syncTabs();
  if (mode==="listen") initListenSession();
  else initSession();
}

function syncTabs() {
  ["flash","quiz","write","review","listen"].forEach(m=>{
    document.getElementById("tab-"+m)?.classList.toggle("active",m===m1Mode);
    document.getElementById("area-"+m)?.classList.toggle("hidden",m!==m1Mode);
  });
}

// ════════════════════════════════════════
//  MODUL 2
// ════════════════════════════════════════
function m2SelectLang(lang,flag,name) {
  if (!m2Vocab.length) { alert("Daten werden geladen."); return; }
  m2Lang=lang; m2LangFlag=flag; m2LangName=name;
  setText("m2-cur-flag",flag); setText("m2-cur-name",name);
  m2ShowApp(); m2Mode="flash"; m2SyncTabs(); m2Init();
  setTimeout(()=>document.getElementById("m2-app")?.scrollIntoView({behavior:"smooth",block:"start"}),100);
}
function m2ChangeLang() {
  m2ShowLang();
  setTimeout(()=>document.getElementById("m2-lang-screen")?.scrollIntoView({behavior:"smooth",block:"start"}),100);
}
function m2ShowApp() {
  const l=document.getElementById("m2-lang-screen"),a=document.getElementById("m2-app");
  if(l) l.style.display="none"; if(a) a.style.display="block";
}
function m2ShowLang() {
  const l=document.getElementById("m2-lang-screen"),a=document.getElementById("m2-app");
  if(a) a.style.display="none"; if(l) l.style.display="flex";
}
function m2Init() {
  const unit=val("m2-unit");
  m2Session=unit==="all"?[...m2Vocab]:m2Vocab.filter(v=>String(v[M2C.lesson])===unit);
  m2Session.sort(()=>Math.random()-.5); m2Index=0; m2Stats={correct:0,wrong:0}; m2Render();
}
function m2Shuffle() { m2Session.sort(()=>Math.random()-.5); m2Index=0; m2Render(); }
function m2SetMode(mode) { m2Mode=mode; m2SyncTabs(); m2Render(); }
function m2SyncTabs() {
  document.getElementById("m2-tab-flash")?.classList.toggle("active",m2Mode==="flash");
  document.getElementById("m2-tab-quiz")?.classList.toggle("active",m2Mode==="quiz");
  if(m2Mode==="flash"){show("m2-flash-area");hide("m2-quiz-area");}
  else{hide("m2-flash-area");show("m2-quiz-area");}
}
function m2Render() {
  if(!m2Session.length) return;
  if(m2Index>=m2Session.length){alert("🎉 Alle Karten abgeschlossen!");m2Index=0;}
  const item=m2Session[m2Index];
  const pct=Math.round(m2Index/m2Session.length*100);
  setText("m2-total",m2Session.length); setText("m2-correct",m2Stats.correct);
  setText("m2-wrong",m2Stats.wrong);
  const tot=m2Stats.correct+m2Stats.wrong;
  setText("m2-pct",tot>0?Math.round(m2Stats.correct/tot*100)+"%":"0%");
  const fill=document.getElementById("m2-prog-fill"); if(fill) fill.style.width=pct+"%";
  const favBtn=document.getElementById("m2-fav-btn");
  if(favBtn) favBtn.textContent=m2FavSet.has(item[M2C.de]||"")?"★":"☆";
  if(m2Mode==="flash") m2RenderFlash(item); else m2RenderQuiz(item);
}
function m2RenderFlash(item) {
  const lekt=item[M2C.lesson]?"Lektion "+item[M2C.lesson]:"";
  setText("m2-de",item[M2C.de]||""); setText("m2-lektion-badge",lekt);
  setText("m2-tr",item[m2Lang]||"(keine Übersetzung)"); setText("m2-sent",item[M2C.sentence]||"");
  setText("m2-lektion-badge-back",lekt); show("m2-card-front"); hide("m2-card-back");
}
function m2Flip() {
  const front=document.getElementById("m2-card-front"),back=document.getElementById("m2-card-back");
  if(!front||!back) return;
  if(!back.classList.contains("hidden")){show("m2-card-front");hide("m2-card-back");}
  else{hide("m2-card-front");show("m2-card-back");}
}
function m2RenderQuiz(item) {
  const correct=item[m2Lang]||"";
  setText("m2-qq",item[M2C.de]||""); setText("m2-qmeta","#"+(m2Index+1)+" / "+m2Session.length);
  const qp=document.getElementById("m2-quiz-prog");
  if(qp) qp.style.width=Math.round(m2Index/m2Session.length*100)+"%";
  const box=document.getElementById("m2-qopts"); if(!box) return; box.innerHTML="";
  const opts=[correct].filter(Boolean); let guard=0;
  while(opts.length<4&&guard++<600){const r=m2Vocab[Math.floor(Math.random()*m2Vocab.length)][m2Lang];if(r&&!opts.includes(r))opts.push(r);}
  while(opts.length<4) opts.push("—");
  opts.sort(()=>Math.random()-.5);
  opts.forEach(opt=>{
    const btn=document.createElement("button"); btn.className="m2-opt"; btn.textContent=opt;
    btn.onclick=()=>{
      box.querySelectorAll("button").forEach(b=>b.disabled=true);
      if(opt===correct){btn.classList.add("c-ok");m2Stats.correct++;if(!m2LearnedSet.has(item[M2C.de]))m2LearnedSet.add(item[M2C.de]);setTimeout(m2Next,480);}
      else{btn.classList.add("c-err");m2Stats.wrong++;box.querySelectorAll("button").forEach(b=>{if(b.textContent===correct)b.classList.add("c-ok");});setTimeout(m2Next,700);}
      setText("m2-correct",m2Stats.correct); setText("m2-wrong",m2Stats.wrong);
      const t2=m2Stats.correct+m2Stats.wrong; setText("m2-pct",t2>0?Math.round(m2Stats.correct/t2*100)+"%":"0%");
    };
    box.appendChild(btn);
  });
}
function m2Next(){m2Index++;m2Render();}
function m2Prev(){if(m2Index>0){m2Index--;m2Render();}}
function m2MarkLearned(){const item=m2Session[m2Index];if(item)m2LearnedSet.add(item[M2C.de]||"");m2Stats.correct++;setText("m2-correct",m2Stats.correct);m2Next();}
function m2ToggleFav(){const item=m2Session[m2Index];if(!item)return;const key=item[M2C.de]||"";if(m2FavSet.has(key))m2FavSet.delete(key);else m2FavSet.add(key);const btn=document.getElementById("m2-fav-btn");if(btn)btn.textContent=m2FavSet.has(key)?"★":"☆";}

// ════════════════════════════════════════
//  YARDIMCI
// ════════════════════════════════════════
function setText(id,txt){const e=document.getElementById(id);if(e)e.innerText=String(txt);}
function val(id){const e=document.getElementById(id);return e?e.value:"";}
function show(id){document.getElementById(id)?.classList.remove("hidden");}
function hide(id){document.getElementById(id)?.classList.add("hidden");}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}

// ════════════════════════════════════════
//  BAŞLAT
// ════════════════════════════════════════
loadModul1();
loadModul2();
