/* GameVault Discovery v0.3: curated fallback + live Wikidata suggestions;
   IGDB metadata and cover variants become available via the optional authenticated Worker.
   NEVER store Twitch client secrets in this public file. */
(() => {
  'use strict';
  const searchCache = new Map();
  const cfg = window.GV;
  const endpoint = String(window.GV_DISCOVERY_WORKER || '').replace(/\/$/, '');
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  const isUrl = s => { try { const u = new URL(s); return u.protocol === 'https:' ? u.href : ''; } catch {return '';} };
  const curated = c => ({ id: 'curated:'+c.key, source: 'curated', key: c.key, title: c.title, year: c.year || null, publisher: c.publisher || '', developer:c.developer||'', genre:c.genre||'', editions:c.editions||[], cover:c.cover||'', sourceUrl:c.source||'', platforms:c.platforms||[], confidence:'catalogue reference' });
  const local = (q, platform) => cfg.catalog.filter(c => c.platforms.includes(platform) && norm(c.title).includes(norm(q))).slice(0,8).map(curated);
  async function worker(action, params = {}, signal) {
    if (!endpoint) return null;
    const user = window.GVCloud?.getUser?.();
    if(!user || !user.getIdToken) return null;
    const token = await user.getIdToken();
    const url = new URL(endpoint + '/' + action);
    Object.entries(params).forEach(([key,value])=>url.searchParams.set(key, String(value)));
    const response = await fetch(url.href,{headers:{Authorization:'Bearer '+token},signal});
    if(!response.ok) {
      let errorPayload={};
      try { errorPayload=await response.json(); } catch {}
      const detail=String(errorPayload?.error||'Request failed').slice(0,140);
      throw new Error('HTTP '+response.status+': '+detail);
    }
    return response.json();
  }
  async function wikidata(query, signal) {
    const url = new URL('https://www.wikidata.org/w/api.php');
    Object.entries({action:'wbsearchentities',format:'json',language:'en',uselang:'en',type:'item',limit:'12',origin:'*',search:query}).forEach(([k,v])=>url.searchParams.set(k,v));
    const response = await fetch(url.href,{signal});
    if(!response.ok)throw new Error('Wikidata search unavailable');
    const data = await response.json();
    return (data.search||[]).filter(x=>/\b(video game|computer game|game series|gaming franchise|role.playing game|action.adventure game)\b/i.test(x.description||''))
      .map(x=>({id:'wikidata:'+x.id,source:'wikidata',key:'',title:x.label,year:null,publisher:'',developer:'',genre:'',editions:[],cover:'',sourceUrl:'https://www.wikidata.org/wiki/'+x.id,platforms:[],confidence:'platform unverified',description:x.description||''}));
  }
  const dedupe = items => {let used=new Set();return items.filter(x=>{let k=norm(x.title);if(!k||used.has(k))return false;used.add(k);return true;});};
  async function search(query,platform,{signal}={}) {
    const q=String(query||'').trim().slice(0,90);
    if(q.length<2)return {results:[],note:'Enter at least two characters.',source:'none'};
    const key=platform+':'+norm(q);
    if(searchCache.has(key))return searchCache.get(key);
    let owned=local(q,platform), remote=[], source='local', note='Reference matches (platform-filtered).', igdbFailure='';
    if(endpoint){try {const result=await worker('search',{q,platform},signal);remote=result?.results||[];source='IGDB';note='IGDB results filtered to this platform.';} catch(e){if(e.name==='AbortError')throw e;igdbFailure=String(e?.message||'connection failed');note='IGDB is unavailable. Showing other suggestions.';}}
    if(!remote.length){try{remote=await wikidata(q,signal);source=remote.length?'Wikidata + local':'local';note=remote.length?'Wikidata results require platform confirmation; reference matches are platform-filtered.':'Only reference matches available; live search unavailable.';}catch(e){if(e.name==='AbortError')throw e;note='Live suggestions unavailable. You can still select a reference title or enter a custom title.';}}
    if(igdbFailure) note+=' IGDB diagnostic: '+igdbFailure+'.';
    const result={results:dedupe([...owned,...remote]).slice(0,15),source,note};
    searchCache.set(key,result);
    if(searchCache.size>45)searchCache.delete(searchCache.keys().next().value);
    return result;
  }
  async function details(candidate,{signal}={}) {
    if(!candidate)return null;
    if(candidate.source==='curated')return candidate;
    if(candidate.source==='igdb' && endpoint){let res=await worker('game',{id:String(candidate.id).replace(/^igdb:/,'')},signal);return {...candidate,...res?.game,source:'igdb'};}
    if(candidate.source==='wikidata'){
      // Wikidata details are partial; do NOT fill publisher/editions with guesses.
      const id=String(candidate.id).replace(/^wikidata:/,'');
      const url=new URL('https://www.wikidata.org/w/api.php');
      Object.entries({action:'wbgetentities',format:'json',ids:id,props:'claims|labels|descriptions',languages:'en',origin:'*'}).forEach(([k,v])=>url.searchParams.set(k,v));
      try{let r=await fetch(url.href,{signal});if(!r.ok)throw new Error('Unavailable');let j=await r.json();let entity=j.entities?.[id];let date=entity?.claims?.P577?.[0]?.mainsnak?.datavalue?.value?.time||'';let year=/^[+-]?(\d{4})/.exec(date)?.[1];return {...candidate,year:year?Number(year):candidate.year};}catch(e){if(e.name==='AbortError')throw e;return candidate;}
    }
    return candidate;
  }
  function localCoverCandidates(title, platform, currentUrl){
    const picks=[];const push=(url,label,source)=>{url=isUrl(url);if(!url||picks.some(x=>x.url===url))return;picks.push({url,label,source,verified:false});};
    if(currentUrl)push(currentUrl,'Current cover','saved');
    const exact=cfg.catalog.find(x=>norm(x.title)===norm(title) && x.platforms.includes(platform));
    // The reference illustrations were verified only as candidates for the ORIGINAL platform.
    const original={requiem:'ps5',gtavi:'ps5',spider2:'ps5',miles:'ps5',astro:'ps5',minecraft:'switch',smash:'switch'};
    if(exact&&original[exact.key]===platform)push(exact.cover,'Reference candidate','curated');
    return picks;
  }
  async function covers({id,title,platform,currentUrl},{signal}={}) {
    const list=localCoverCandidates(title,platform,currentUrl);
    if(endpoint){
      let igdbId=String(id||'').startsWith('igdb:')?String(id).slice(5):null;
      if(!igdbId){try{const res=await worker('search',{q:title,platform},signal);const exact=(res?.results||[]).find(x=>norm(x.title)===norm(title));igdbId=exact?String(exact.id).replace(/^igdb:/,''):null;}catch(e){if(e.name==='AbortError')throw e;}}
      if(igdbId){try{const res=await worker('covers',{id:igdbId,platform},signal);for(const x of (res?.covers||[])){const url=isUrl(x.url);if(url&&!list.some(p=>p.url===url))list.push({url,label:x.label||'IGDB cover',source:'igdb',region:x.region||'',verified:false});}}catch(e){if(e.name==='AbortError')throw e;}}
    }
    return {covers:list,note:endpoint?'Cover candidates from IGDB and references. Verify US/platform manually before approval.':'For more cover variants, connect the optional IGDB Worker. Existing references are shown now; no image is automatically US-verified.'};
  }
  window.GVDiscovery={search,details,covers,curated,local,enabled:Boolean(endpoint)};
})();
