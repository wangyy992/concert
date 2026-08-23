"use strict";
/* ============================================================
   My Concert Builder — 前端逻辑
   数据存在浏览器 localStorage，纯本地、刷新不丢。
   ============================================================ */

const LS = {
  state: "cb_state_v1",       // 演唱会编排
  overrides: "cb_overrides_v1", // 曲库歌曲的 yt 链接覆盖  key -> ytId
  custom: "cb_custom_v1",     // 手动添加的歌   [{group, album, title, yt}]
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 9);
const songKey = (g, al, t) => `${g}|||${al}|||${t}`;

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

/* ---------- 运行时状态 ---------- */
let overrides = load(LS.overrides, {});   // key -> ytId
let custom = load(LS.custom, []);         // 自定义歌
let currentGroup = "itzy";

let concert = load(LS.state, null) || {
  name: "",
  intro: null,                             // item | null
  parts: [{ id: uid(), title: "Part 1", items: [] }],
  outro: null,                             // item | null
};

function persist() { save(LS.state, concert); }

/* ---------- 组合曲库（合并 overrides 与自定义歌）---------- */
function getGroupAlbums(groupId) {
  const base = (window.LIBRARY[groupId]?.albums || []).map(al => ({
    ...al,
    tracks: al.tracks.map(tr => {
      const k = songKey(groupId, al.title, tr.title);
      return { ...tr, yt: overrides[k] ?? tr.yt ?? "", _key: k, _album: al.title };
    }),
  }));
  const mine = custom.filter(c => c.group === groupId);
  if (mine.length) {
    // 按自定义 album 分组
    const byAlbum = {};
    mine.forEach(c => {
      const alName = c.album || "自定义";
      (byAlbum[alName] ||= []).push(c);
    });
    Object.entries(byAlbum).forEach(([alName, list]) => {
      base.push({
        title: alName, year: "", type: "自定义", custom: true,
        tracks: list.map(c => {
          const k = songKey(groupId, alName, c.title);
          return { title: c.title, yt: overrides[k] ?? c.yt ?? "", _key: k, _album: alName, custom: true };
        }),
      });
    });
  }
  return base;
}

function resolveYt(groupId, album, title) {
  const k = songKey(groupId, album, title);
  if (overrides[k] != null) return overrides[k];
  const al = (window.LIBRARY[groupId]?.albums || []).find(a => a.title === album);
  const tr = al?.tracks.find(t => t.title === title);
  if (tr) return tr.yt || "";
  const c = custom.find(x => x.group === groupId && (x.album || "自定义") === album && x.title === title);
  return c?.yt || "";
}

/* ============================================================
   曲库渲染（左侧）
   ============================================================ */
function renderGroupTabs() {
  const wrap = $("#groupTabs");
  wrap.innerHTML = "";
  Object.entries(window.LIBRARY).forEach(([id, g]) => {
    const b = document.createElement("div");
    b.className = "group-tab" + (id === currentGroup ? " active" : "");
    b.textContent = g.name;
    if (id === currentGroup) b.style.background = g.color;
    b.onclick = () => { currentGroup = id; renderGroupTabs(); renderLibrary(); };
    wrap.appendChild(b);
  });
}

function renderLibrary() {
  const q = $("#search").value.trim().toLowerCase();
  const list = $("#albumList");
  list.innerHTML = "";
  const gColor = window.LIBRARY[currentGroup].color;

  getGroupAlbums(currentGroup).forEach(al => {
    const tracks = al.tracks.filter(tr =>
      !q || tr.title.toLowerCase().includes(q) || al.title.toLowerCase().includes(q)
      || (tr.title_kr && tr.title_kr.includes(q))
    );
    if (!tracks.length) return;

    const album = document.createElement("div");
    album.className = "album" + (q ? " open" : "");

    const head = document.createElement("div");
    head.className = "album-head";
    head.innerHTML = `
      <div class="album-cover" style="background:${gColor}">${al.title.slice(0,1)}</div>
      <div class="album-meta">
        <div class="album-title">${escapeHtml(al.title)}</div>
        <div class="album-sub">${al.year ? al.year + " · " : ""}${al.type} · ${al.tracks.length} 首</div>
      </div>
      <div class="album-caret">▾</div>`;
    head.onclick = () => album.classList.toggle("open");
    album.appendChild(head);

    const tl = document.createElement("div");
    tl.className = "track-list";
    tracks.forEach(tr => tl.appendChild(renderTrackRow(tr, al)));
    album.appendChild(tl);
    list.appendChild(album);
  });

  if (!list.children.length) {
    list.innerHTML = `<div class="part-empty">没有匹配的歌曲</div>`;
  }
}

function renderTrackRow(tr, al) {
  const row = document.createElement("div");
  row.className = "track";
  const hasAudio = !!tr.yt;
  row.innerHTML = `
    <div class="track-name">
      <div class="t">${tr.lead ? '<span class="lead-star">★</span> ' : ""}${escapeHtml(tr.title)}</div>
      ${tr.title_kr ? `<div class="kr">${escapeHtml(tr.title_kr)}</div>` : ""}
    </div>
    <span class="${hasAudio ? "has-audio" : "no-audio"}">${hasAudio ? "♪ 有音源" : "无音源"}</span>
  `;

  const playBtn = document.createElement("button");
  playBtn.className = "btn mini";
  playBtn.textContent = "▶";
  playBtn.title = "试听";
  playBtn.onclick = () => {
    const yt = resolveYt(currentGroup, tr._album, tr.title);
    if (yt) playSingle({ title: tr.title, group: window.LIBRARY[currentGroup].name, yt });
    else fillAudio(currentGroup, tr._album, tr.title);
  };

  const linkBtn = document.createElement("button");
  linkBtn.className = "btn mini";
  linkBtn.textContent = hasAudio ? "🔗" : "🔎";
  linkBtn.title = hasAudio ? "换音源链接" : "找音源并粘贴链接";
  linkBtn.onclick = () => fillAudio(currentGroup, tr._album, tr.title);

  const addBtn = document.createElement("button");
  addBtn.className = "btn mini";
  addBtn.textContent = "＋";
  addBtn.title = "加入演唱会";
  addBtn.onclick = () => addToDestination(tr, al);

  row.appendChild(playBtn);
  row.appendChild(linkBtn);
  row.appendChild(addBtn);
  return row;
}

/* ---------- 补 / 换音源链接 ---------- */
function fillAudio(groupId, album, title) {
  const gName = window.LIBRARY[groupId].name;
  const cur = resolveYt(groupId, album, title);
  const searchUrl = "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(`${gName} ${title} official MV`);
  const input = prompt(
    `为《${title}》设置 YouTube 音源。\n\n` +
    `1) 先在打开的 YouTube 搜索页里找到官方视频\n` +
    `2) 复制它的链接，粘贴到这里 👇\n\n` +
    `（留空并确定 = 清除；取消 = 不改）`,
    cur ? `https://youtu.be/${cur}` : ""
  );
  // 顺手打开搜索页
  if (input === null) return;                 // 取消
  window.open(searchUrl, "_blank");
  const id = parseYt(input);
  const k = songKey(groupId, album, title);
  if (input.trim() === "") { delete overrides[k]; }
  else if (id) { overrides[k] = id; }
  else { alert("没识别出 YouTube 链接，未改动。"); return; }
  save(LS.overrides, overrides);
  renderLibrary(); renderBuilder();
}

function parseYt(url) {
  if (!url) return "";
  url = url.trim();
  if (/^[\w-]{11}$/.test(url)) return url;      // 直接是 ID
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : "";
}

/* ============================================================
   编排区（右侧）
   ============================================================ */
function makeItem(tr, al) {
  return {
    uid: uid(),
    group: currentGroup,
    groupName: window.LIBRARY[currentGroup].name,
    album: al.title,
    title: tr.title,
    yt: resolveYt(currentGroup, al.title, tr.title),
    tag: "stage",
  };
}

function addToDestination(tr, al) {
  const dest = $("#destSelect").value;
  const item = makeItem(tr, al);
  if (dest === "intro") { concert.intro = item; }
  else if (dest === "outro") { concert.outro = item; }
  else {
    const part = concert.parts.find(p => p.id === dest);
    if (part) part.items.push(item);
  }
  persist(); renderBuilder();
}

function renderDestSelect() {
  const sel = $("#destSelect");
  const prev = sel.value;
  sel.innerHTML = "";
  const add = (v, label) => { const o = document.createElement("option"); o.value = v; o.textContent = label; sel.appendChild(o); };
  add("intro", "Intro");
  concert.parts.forEach((p, i) => add(p.id, p.title || `Part ${i + 1}`));
  add("outro", "Outro");
  // 默认选中最后一个 part
  if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
  else if (concert.parts.length) sel.value = concert.parts[concert.parts.length - 1].id;
}

function tagBadge(tag) {
  const t = window.TAGS[tag] || window.TAGS.stage;
  const span = document.createElement("span");
  span.className = "tag-badge";
  span.style.background = t.color + "22";
  span.style.color = t.color;
  span.style.border = "1px solid " + t.color + "66";
  span.textContent = `${t.emoji} ${t.label}`;
  return span;
}

function renderSlotItem(item, kind) {
  const el = document.createElement("div");
  el.className = "item";
  el.innerHTML = `
    <span class="item-name">${escapeHtml(item.title)}</span>
    <span class="item-group">${escapeHtml(item.groupName)}</span>`;
  const play = smallBtn(item.yt ? "▶" : "🔎", () => {
    if (item.yt) playSingle(item);
    else fillAudio(item.group, item.album, item.title);
  });
  const rm = smallBtn("✕", () => {
    if (kind === "intro") concert.intro = null; else concert.outro = null;
    persist(); renderBuilder();
  });
  el.appendChild(play); el.appendChild(rm);
  return el;
}

function renderPartItem(item, part, idx) {
  const el = document.createElement("div");
  el.className = "item";
  el.draggable = true;
  el.dataset.uid = item.uid;

  const idxEl = document.createElement("span");
  idxEl.className = "idx"; idxEl.textContent = idx + 1;

  const name = document.createElement("span");
  name.className = "item-name";
  name.innerHTML = `${escapeHtml(item.title)} <span class="item-group">· ${escapeHtml(item.groupName)}</span>`;

  const tagSel = document.createElement("select");
  tagSel.className = "tag-sel";
  Object.entries(window.TAGS).forEach(([k, t]) => {
    const o = document.createElement("option");
    o.value = k; o.textContent = `${t.emoji} ${t.label}`;
    if (k === item.tag) o.selected = true;
    tagSel.appendChild(o);
  });
  tagSel.onchange = () => { item.tag = tagSel.value; persist(); };

  const play = smallBtn(item.yt ? "▶" : "🔎", () => {
    if (item.yt) playSingle(item);
    else fillAudio(item.group, item.album, item.title);
  });
  const rm = smallBtn("✕", () => {
    part.items = part.items.filter(x => x.uid !== item.uid);
    persist(); renderBuilder();
  });

  const move = document.createElement("span");
  move.className = "move";
  move.appendChild(smallBtn("▲", () => moveItem(part, idx, -1)));
  move.appendChild(smallBtn("▼", () => moveItem(part, idx, +1)));

  el.appendChild(idxEl);
  el.appendChild(name);
  el.appendChild(tagSel);
  el.appendChild(move);
  el.appendChild(play);
  el.appendChild(rm);

  // 拖拽排序
  el.addEventListener("dragstart", e => { e.dataTransfer.setData("text/plain", item.uid); el.style.opacity = ".4"; });
  el.addEventListener("dragend", () => { el.style.opacity = "1"; });
  el.addEventListener("dragover", e => e.preventDefault());
  el.addEventListener("drop", e => {
    e.preventDefault();
    const fromUid = e.dataTransfer.getData("text/plain");
    dropReorder(part, fromUid, item.uid);
  });
  return el;
}

function moveItem(part, idx, dir) {
  const j = idx + dir;
  if (j < 0 || j >= part.items.length) return;
  [part.items[idx], part.items[j]] = [part.items[j], part.items[idx]];
  persist(); renderBuilder();
}
function dropReorder(part, fromUid, toUid) {
  if (fromUid === toUid) return;
  const from = part.items.findIndex(x => x.uid === fromUid);
  const to = part.items.findIndex(x => x.uid === toUid);
  if (from < 0 || to < 0) return;
  const [moved] = part.items.splice(from, 1);
  part.items.splice(to, 0, moved);
  persist(); renderBuilder();
}

function smallBtn(txt, fn) {
  const b = document.createElement("button");
  b.className = "btn mini"; b.textContent = txt; b.onclick = fn;
  return b;
}

function renderBuilder() {
  renderDestSelect();

  // intro
  const introSlot = $("#introSlot"); introSlot.innerHTML = "";
  if (concert.intro) introSlot.appendChild(renderSlotItem(concert.intro, "intro"));
  else introSlot.textContent = "空 — 选「添加到：Intro」后从曲库点 ＋";

  // outro
  const outroSlot = $("#outroSlot"); outroSlot.innerHTML = "";
  if (concert.outro) outroSlot.appendChild(renderSlotItem(concert.outro, "outro"));
  else outroSlot.textContent = "空 — 选「添加到：Outro」后从曲库点 ＋";

  // parts
  const wrap = $("#partsWrap"); wrap.innerHTML = "";
  concert.parts.forEach((part, pi) => {
    const box = document.createElement("div");
    box.className = "part";

    const head = document.createElement("div");
    head.className = "part-head";
    const titleInput = document.createElement("input");
    titleInput.className = "part-title";
    titleInput.value = part.title || `Part ${pi + 1}`;
    titleInput.oninput = () => { part.title = titleInput.value; persist(); renderDestSelect(); };
    const count = document.createElement("span");
    count.className = "part-count"; count.textContent = `${part.items.length} 首`;
    const del = smallBtn("删除 Part", () => {
      if (concert.parts.length <= 1) { alert("至少保留一个 Part"); return; }
      if (part.items.length && !confirm(`删除「${part.title}」及其 ${part.items.length} 首歌？`)) return;
      concert.parts = concert.parts.filter(p => p.id !== part.id);
      persist(); renderBuilder();
    });
    del.classList.add("btn-ghost");
    head.appendChild(titleInput); head.appendChild(count); head.appendChild(del);

    const items = document.createElement("div");
    items.className = "part-items";
    if (!part.items.length) {
      const e = document.createElement("div");
      e.className = "part-empty"; e.textContent = "还没有歌 — 从左边曲库点 ＋ 加进来";
      items.appendChild(e);
    } else {
      part.items.forEach((it, idx) => items.appendChild(renderPartItem(it, part, idx)));
    }

    box.appendChild(head); box.appendChild(items);
    wrap.appendChild(box);
  });

  renderStats();
}

function renderStats() {
  const bar = $("#statBar");
  const all = collectQueue(true);   // 含无音源
  const total = all.length;
  const withAudio = all.filter(i => i.yt).length;
  const counts = { stage: 0, float: 0, patrol: 0, fansa: 0 };
  concert.parts.forEach(p => p.items.forEach(i => { counts[i.tag] = (counts[i.tag] || 0) + 1; }));
  bar.innerHTML =
    `<span>总曲目 <b>${total}</b></span>` +
    `<span>有音源 <b>${withAudio}</b></span>` +
    `<span>Part 数 <b>${concert.parts.length}</b></span>` +
    Object.entries(window.TAGS).map(([k, t]) =>
      `<span>${t.emoji} ${t.label} <b>${counts[k] || 0}</b></span>`).join("");
}

/* 收集整场顺序：intro → 各 part → outro */
function collectQueue(includeNoAudio = false) {
  const q = [];
  if (concert.intro) q.push(concert.intro);
  concert.parts.forEach(p => p.items.forEach(i => q.push(i)));
  if (concert.outro) q.push(concert.outro);
  return includeNoAudio ? q : q.filter(i => i.yt);
}

/* ============================================================
   YouTube 播放器
   ============================================================ */
let player = null, playerReady = false, queue = [], qIndex = 0;

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("ytplayer", {
    height: "124", width: "220",
    playerVars: { autoplay: 1, playsinline: 1, rel: 0 },
    events: {
      onReady: () => { playerReady = true; },
      onStateChange: e => { if (e.data === YT.PlayerState.ENDED) nextInQueue(); updateToggle(); },
    },
  });
};

function loadYTApi() {
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
}

function playSingle(item) { startQueue([item], 0); }

function playAll() {
  const q = collectQueue(false);
  if (!q.length) { alert("还没有可播放的歌（需要有音源的曲目）。先给歌配上 YouTube 链接吧。"); return; }
  startQueue(q, 0);
}

function startQueue(items, idx) {
  queue = items; qIndex = idx;
  playCurrent();
}
function playCurrent() {
  const it = queue[qIndex];
  if (!it) return;
  $("#pbNow").textContent = `${it.title}`;
  $("#pbSub").textContent = `${it.groupName || it.group}` +
    (queue.length > 1 ? `  ·  ${qIndex + 1}/${queue.length}` : "");
  const doPlay = () => player.loadVideoById(it.yt);
  if (playerReady && player) doPlay();
  else waitReady(doPlay);
}
function waitReady(cb) {
  const t = setInterval(() => { if (playerReady && player) { clearInterval(t); cb(); } }, 150);
}
function nextInQueue() {
  if (qIndex < queue.length - 1) { qIndex++; playCurrent(); }
  else { $("#pbSub").textContent = "整场播放结束 🎉"; }
}
function prevInQueue() { if (qIndex > 0) { qIndex--; playCurrent(); } }
function updateToggle() {
  if (!player || !player.getPlayerState) return;
  $("#pbToggle").textContent = player.getPlayerState() === YT.PlayerState.PLAYING ? "⏸" : "▶";
}

/* ============================================================
   导出 / 导入 / 重置 / 手动加歌
   ============================================================ */
function exportSetlist() {
  const lines = [];
  lines.push(`🎤 ${concert.name || "My Concert"}`);
  lines.push("=".repeat(28));
  if (concert.intro) lines.push(`[INTRO] ${concert.intro.title} — ${concert.intro.groupName}`);
  concert.parts.forEach((p, i) => {
    lines.push("");
    lines.push(`▸ ${p.title || "Part " + (i + 1)}`);
    p.items.forEach((it, j) => {
      const t = window.TAGS[it.tag];
      lines.push(`   ${j + 1}. ${it.title} — ${it.groupName}  ${t.emoji}${t.label}`);
    });
  });
  if (concert.outro) { lines.push(""); lines.push(`[OUTRO] ${concert.outro.title} — ${concert.outro.groupName}`); }
  const text = lines.join("\n");

  // 弹窗给出：复制文本 + 下载 json
  const blob = new Blob([JSON.stringify({ concert, overrides, custom }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${(concert.name || "concert").replace(/\s+/g, "_")}.json`;
  a.click(); URL.revokeObjectURL(url);

  navigator.clipboard?.writeText(text).catch(() => {});
  alert("已下载歌单存档（.json，可再导入）。\n文本版歌单也已复制到剪贴板：\n\n" + text);
}

function importSetlist(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.concert) concert = data.concert;
      if (data.overrides) { overrides = data.overrides; save(LS.overrides, overrides); }
      if (data.custom) { custom = data.custom; save(LS.custom, custom); }
      persist(); renderGroupTabs(); renderLibrary(); renderBuilder();
      alert("导入成功！");
    } catch { alert("文件解析失败，请确认是本工具导出的 .json"); }
  };
  reader.readAsText(file);
}

function resetConcert() {
  if (!confirm("清空当前演唱会编排？（曲库和你补的音源链接会保留）")) return;
  concert = { name: "", intro: null, parts: [{ id: uid(), title: "Part 1", items: [] }], outro: null };
  persist(); renderBuilder(); $("#concertName").value = "";
}

function addSongManual() {
  const gName = window.LIBRARY[currentGroup].name;
  const title = prompt(`给 ${gName} 手动添加一首歌，输入歌名：`);
  if (!title || !title.trim()) return;
  const link = prompt("YouTube 链接（可留空，之后再补）：", "");
  const id = parseYt(link || "");
  custom.push({ group: currentGroup, album: "自定义", title: title.trim(), yt: id });
  save(LS.custom, custom);
  renderLibrary();
}

/* ============================================================
   工具 & 初始化
   ============================================================ */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function init() {
  // 顶栏
  $("#concertName").value = concert.name || "";
  $("#concertName").oninput = e => { concert.name = e.target.value; persist(); };
  $("#playAllBtn").onclick = playAll;
  $("#exportBtn").onclick = exportSetlist;
  $("#importBtn").onclick = () => $("#importFile").click();
  $("#importFile").onchange = e => { if (e.target.files[0]) importSetlist(e.target.files[0]); };
  $("#resetBtn").onclick = resetConcert;
  $("#addSongBtn").onclick = addSongManual;
  $("#addPartBtn").onclick = () => {
    concert.parts.push({ id: uid(), title: `Part ${concert.parts.length + 1}`, items: [] });
    persist(); renderBuilder();
  };
  $("#search").oninput = renderLibrary;

  // 播放条
  $("#pbToggle").onclick = () => {
    if (!player) return;
    const st = player.getPlayerState();
    if (st === YT.PlayerState.PLAYING) player.pauseVideo(); else player.playVideo();
  };
  $("#pbPrev").onclick = prevInQueue;
  $("#pbNext").onclick = nextInQueue;
  $("#pbClose").onclick = () => { player && player.pauseVideo(); };

  renderGroupTabs();
  renderLibrary();
  renderBuilder();
  loadYTApi();
}

document.addEventListener("DOMContentLoaded", init);
