// TransPac planner — computation engine (pure functions, no DOM).
// GENAVIR Guide carottiers DEC-SEEM/2024_041 V4.0 p.13 (N/O Pourquoi Pas ?, Calypso II "Long <36 m").
const INSTR = ["CS","C1","C2","MN","NP","NM"];
const R_NM = 3440.065;

function haversineNm(lon1, lat1, lon2, lat2){
  const r = Math.PI/180, p1 = lat1*r, p2 = lat2*r, dp = (lat2-lat1)*r, dl = (lon2-lon1)*r;
  const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R_NM*Math.asin(Math.sqrt(a));
}
function num(v){ const x = parseFloat(v); return isFinite(x) ? x : 0; }
function stationTz(s){
  if (s.tz !== null && s.tz !== undefined && s.tz !== "" && isFinite(parseFloat(s.tz))) return parseFloat(s.tz);
  return Math.round(num(s.lon)/15);
}
function calypsoHours(s, P){
  if (!s.CA) return 0;
  if (s.CA_override !== null && s.CA_override !== undefined && s.CA_override !== "" && isFinite(parseFloat(s.CA_override)))
    return parseFloat(s.CA_override);
  const z = num(s.depth);
  let h = 2*z/(3600*num(P.winch_ms)) + num(P.ca_fixed_h);
  if (P.ca_round_up) h = Math.ceil(h - 1e-9);
  return h + num(s.CA_bonus);
}
function multitubeMinHours(s, P){ return 2*num(s.depth)/(3600*num(P.winch_ms)) + num(P.mt_fixed_h); }
function localToUtcMs(localStr, tz){
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/.exec(localStr || "");
  if (!m) return NaN;
  return Date.UTC(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) - tz*3600e3;
}
function fmt(ms, tz){
  if (!isFinite(ms)) return "";
  const d = new Date(ms + tz*3600e3), p = n => String(n).padStart(2,"0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth()+1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
function stationOps(s){ return INSTR.reduce((a,k)=>a+num(s.ops && s.ops[k]),0); }

function computeLeg(leg, P){
  const rows = [], act = leg.stations.map((s,i)=>({s,i})).filter(o=>o.s.active!==false);
  const t0 = localToUtcMs(leg.depart_local, num(leg.tz_depart));
  let t = t0, prev = null, tot = {transit_h:0, ops_h:0, dist_nm:0, nCA:0, nMT:0, CA_h:0, MT_h:0};
  const segs = [];
  const d0 = (leg.day0===undefined||leg.day0===null||leg.day0==="") ? null : num(leg.day0);
  const mid0 = (()=>{ const z=num(leg.tz_depart), L=new Date(t0+z*3600e3); return Date.UTC(L.getUTCFullYear(),L.getUTCMonth(),L.getUTCDate()) - z*3600e3; })();
  const dayOf = ms => d0===null ? null : d0 + Math.floor((ms - mid0)/86400e3);
  for (const {s,i} of act){
    const dist = prev ? haversineNm(num(prev.lon), num(prev.lat), num(s.lon), num(s.lat)) : 0;
    const tr = dist/num(P.speed_kn);
    const ca = calypsoHours(s,P), mt = s.port ? 0 : num(s.MT);
    const ops = s.port ? 0 : stationOps(s) + ca + mt;
    const arr = t + tr*3600e3, dep = arr + ops*3600e3;
    if (tr>0) segs.push({type:"transit", start:t, end:arr});
    if (ops>0) segs.push({type:"ops", start:arr, end:dep, id:s.id, ca, mt});
    t = dep;
    const tz = stationTz(s), flags = [];
    const z = s.depth===null||s.depth===""||s.depth===undefined ? null : num(s.depth);
    if (!s.port && (s.CA||mt>0) && z===null) flags.push({lvl:"err", msg:"profondeur manquante"});
    if (z!==null && (s.CA||mt>0) && z>num(P.winch_max_m)) flags.push({lvl:"err", msg:`> prof. max treuil ${P.winch_max_m} m`});
    else if (z!==null && (s.CA||mt>0) && z>num(P.winch_limited_m)) flags.push({lvl:"warn", msg:`> ${P.winch_limited_m} m (si treuil limité)`});
    if (s.CA && num(s.ops&&s.ops.CS)===0) flags.push({lvl:"info", msg:"Calypso sans site survey"});
    if (mt>0 && z!==null && mt < multitubeMinHours(s,P)-1e-9) flags.push({lvl:"warn", msg:`MT < GENAVIR (${multitubeMinHours(s,P).toFixed(1)} h)`});
    rows.push({idx:i, id:s.id, dist_nm:dist, transit_h:tr, CA_h:ca, MT_h:mt, ops_h:ops, arr, dep, tz,
               arr_loc:fmt(arr,tz), dep_loc:fmt(dep,tz), arr_utc:fmt(arr,0), dep_utc:fmt(dep,0), jarr:dayOf(arr), jdep:dayOf(dep), flags});
    tot.transit_h += tr; tot.ops_h += ops; tot.dist_nm += dist; tot.CA_h += ca; tot.MT_h += mt;
    if (ca>0) tot.nCA++; if (mt>0) tot.nMT++;
    prev = s;
  }
  const elapsed_h = (t - t0)/3600e3, limit_h = num(leg.limit_days)*24;
  const lastTz = rows.length ? rows[rows.length-1].tz : 0;
  // daily load (24 h windows from departure)
  const nDays = Math.max(1, Math.ceil(elapsed_h/24)), daily = Array.from({length:nDays},()=>({ops:0,transit:0}));
  for (const g of segs){
    let a = (g.start - t0)/3600e3; const b = (g.end - t0)/3600e3;
    while (a < b - 1e-9){ const d = Math.floor(a/24), e = Math.min(b,(d+1)*24); if (daily[d]) daily[d][g.type==="ops"?"ops":"transit"] += e-a; a = e; }
  }
  return {rows, segs, daily, t0, tEnd:t, tot, elapsed_h, elapsed_days:elapsed_h/24, limit_h, margin_h:limit_h-elapsed_h,
          deadline_loc:fmt(t0+limit_h*3600e3,lastTz), arrival_loc:fmt(t,lastTz), depart_loc:fmt(t0,num(leg.tz_depart)), jarrival:dayOf(t), jdepart:dayOf(t0)};
}
function computeAll(data){ return data.legs.map(l=>computeLeg(l, data.params)); }

// 2-opt on active stations, first and last (ports) fixed.
function optimizeOrder(leg){
  const act = leg.stations.filter(s=>s.active!==false), inact = leg.stations.filter(s=>s.active===false);
  if (act.length < 4) return 0;
  const d = (a,b)=>haversineNm(num(a.lon),num(a.lat),num(b.lon),num(b.lat));
  const len = r => r.slice(1).reduce((a,s,k)=>a+d(r[k],s),0);
  let route = act.slice(), best = len(route), improved = true;
  const before = best;
  while (improved){
    improved = false;
    for (let i=1;i<route.length-2;i++) for (let j=i+1;j<route.length-1;j++){
      const r2 = route.slice(0,i).concat(route.slice(i,j+1).reverse(), route.slice(j+1));
      const L2 = len(r2); if (L2 < best-1e-6){ route=r2; best=L2; improved=true; }
    }
  }
  const last = route.pop(); leg.stations = route.concat(inact, [last]);
  return before - best;
}
if (typeof module !== "undefined") module.exports = {haversineNm, calypsoHours, computeLeg, computeAll, optimizeOrder, localToUtcMs, fmt};
