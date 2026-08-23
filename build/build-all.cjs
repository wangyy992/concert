const { execSync } = require('child_process');
const fs = require('fs');
const FF = require('ffmpeg-static');
const T = process.env.T || "16";       // clip seconds
const BR = process.env.BR || "32k";    // bitrate
fs.mkdirSync('cache',{recursive:true}); fs.mkdirSync('out',{recursive:true}); fs.mkdirSync('cov',{recursive:true});
const jget = u => JSON.parse(execSync(`curl --retry 3 --retry-delay 1 -sS "${u}"`,{maxBuffer:2e8}).toString());
const dl = (u,f) => execSync(`curl --retry 3 --retry-delay 1 -sS "${u}" -o "${f}"`,{maxBuffer:2e8});
const sleep = ms => execSync(`sleep ${ms/1000}`);
const ARTISTS = { itzy:{name:"ITZY",color:"#ff3d7f"}, lesserafim:{name:"LE SSERAFIM",color:"#5b86ff"} };
const BAD = /(remix|instrumental|\binst\.?\b|sped ?up|slowed|reverb|mash-?up|extended|karaoke|acappella|a cappella|vogue|bounce up|\bebm\b|vamos|super crazy|dance remix|party remixes|\(english|english ver)/i;
const NOISE = /(original (television )?soundtrack|\bOST\b|BASTIONS|Street Dance|Nam-?soon|\bSGF\b|cover [ab] ver|supergirl ver|\(.* ver\.\) ?\[)/i;
const cleanName = n => n.replace(/\s*-\s*(EP|Single).*$/i,"").trim();
const normA = n => cleanName(n).toLowerCase().replace(/\(.*?\)/g,"").replace(/[^a-z0-9]/g,"");
const normT = n => n.toLowerCase().replace(/\(.*?\)/g,"").replace(/\[.*?\]/g,"").replace(/feat.*/,"").replace(/[^a-z0-9]/g,"");
function artistId(name,country){const r=jget(`https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=musicArtist&limit=10&country=${country}`);return (r.results.find(x=>x.artistName.toLowerCase()===name.toLowerCase())||r.results[0])?.artistId;}
const b64=f=>fs.readFileSync(f).toString('base64');

const LIB={}, COVERS={}, PREV={};
let tracks=0, playable=0;
for(const [gid,meta] of Object.entries(ARTISTS)){
  LIB[gid]={name:meta.name,color:meta.color,albums:[]}; COVERS[gid]={}; PREV[gid]={};
  const byName={};
  for(const country of ["US","JP"]){
    let id; try{id=artistId(meta.name,country);}catch(e){continue;} if(!id)continue;
    let albs=[]; try{albs=jget(`https://itunes.apple.com/lookup?id=${id}&entity=album&limit=200&country=${country}`).results.filter(x=>x.collectionType==="Album");}catch(e){}
    for(const a of albs){
      if(BAD.test(a.collectionName)||NOISE.test(a.collectionName))continue;
      const k=normA(a.collectionName);
      const cand={country,id:a.collectionId,name:a.collectionName,date:a.releaseDate||"",tc:a.trackCount,art:a.artworkUrl100};
      if(!byName[k]||cand.tc>byName[k].tc)byName[k]=cand;
    }
    sleep(150);
  }
  const albums=Object.values(byName).sort((a,b)=>a.date.localeCompare(b.date));
  for(const a of albums){
    let ts=[]; try{ts=jget(`https://itunes.apple.com/lookup?id=${a.id}&entity=song&limit=60&country=${a.country}`).results.filter(x=>x.wrapperType==="track");}catch(e){}
    const clean=cleanName(a.name), nAlb=normA(a.name), keep=[];
    for(const t of ts){
      if(BAD.test(t.trackName))continue;
      const nt=normT(t.trackName); if(!nt)continue;
      const lead = nt===nAlb || t.trackNumber===1;
      let hasA=false;
      if(t.previewUrl){
        const idc=`${gid}__${a.id}__${t.trackId}`;
        const raw=`cache/${idc}.m4a`, mp3=`out/${idc}.mp3`;
        try{
          if(!fs.existsSync(raw)) dl(t.previewUrl,raw);
          execSync(`"${FF}" -y -i "${raw}" -t ${T} -ac 1 -c:a libmp3lame -b:a ${BR} "${mp3}" 2>/dev/null`);
          PREV[gid][`${clean}|||${t.trackName}`]=`data:audio/mpeg;base64,${b64(mp3)}`;
          hasA=true; playable++;
        }catch(e){}
      }
      keep.push({title:t.trackName, lead}); tracks++;
    }
    if(!keep.length)continue;
    // cover
    try{ const cu=a.art.replace("100x100bb","200x200bb"); const cf=`cov/${gid}__${a.id}.jpg`;
      if(!fs.existsSync(cf)) dl(cu,cf); COVERS[gid][clean]=`data:image/jpeg;base64,${b64(cf)}`; }catch(e){}
    const type=/EP\s*$/i.test(a.name)?"EP":/Single/i.test(a.name)?"Single":(a.tc>=7?"Full Album":(a.tc<=3?"Single":"EP"));
    LIB[gid].albums.push({title:clean,year:a.date.slice(0,4),type,tracks:keep});
    sleep(120);
  }
  console.log(`${meta.name}: ${LIB[gid].albums.length} albums`);
}
fs.writeFileSync('lib.json',JSON.stringify(LIB));
fs.writeFileSync('covers-data.json',JSON.stringify(COVERS));
fs.writeFileSync('previews-data.json',JSON.stringify(PREV));
const sz=f=>(fs.statSync(f).size/1048576).toFixed(2);
console.log(`tracks=${tracks} playable=${playable}`);
console.log(`sizes MB -> lib:${sz('lib.json')} covers:${sz('covers-data.json')} previews:${sz('previews-data.json')}`);
console.log(`TOTAL data ~ ${(+sz('lib.json')+ +sz('covers-data.json')+ +sz('previews-data.json')).toFixed(2)}MB`);
