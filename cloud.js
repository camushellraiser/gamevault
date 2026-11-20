/* GameVault private cloud adapter.
 * Firebase's web config is a public project identifier, not a password.
 * All inventory records are stored exclusively under /users/{auth.uid}/games.
 * Firestore rules MUST pin the authorized UID before real data is imported.
 * SDK documentation: https://firebase.google.com/docs/web/setup
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, setPersistence, browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js';
import {
  getFirestore, collection, doc, onSnapshot, writeBatch
} from 'https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAFRwVGQ2tIXtRZzrDSnhJMG7mOj200vQQ',
  authDomain: 'gamevault-216ba.firebaseapp.com',
  projectId: 'gamevault-216ba',
  storageBucket: 'gamevault-216ba.firebasestorage.app',
  messagingSenderId: '599831260847',
  appId: '1:599831260847:web:ff7652bc04e21dd5abee5a'
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const db = getFirestore(firebase);
const authRoot = document.getElementById('auth-root');
let currentUser = null;
let authorized = false;
let unsubscribe = null;
let serverDocs = new Map();
let pending = Promise.resolve();
const platforms = new Set(['ps5','ps4','switch','switch2','pc']);

function e(value) {return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function card(title,body,buttons='',extra='') {
  authRoot.hidden = false;
  authRoot.innerHTML = `<div class="auth-card"><div class="auth-symbol">✣</div><div class="auth-kicker">GAMEVAULT / PRIVATE CLOUD</div><h2>${e(title)}</h2><p>${body}</p>${extra}${buttons}</div>`;
}
function userInfo(){return currentUser?`<div class="auth-account"><span>${e(currentUser.email||'Google account')}</span><small>Firebase UID</small><code id="my-uid">${e(currentUser.uid)}</code><button type="button" data-auth-action="copy-uid">Copy UID</button></div>`:'';}
function locked(message='Firestore currently denies access. This is expected until the owner-only rules are published.') {
  authorized = false;
  card('Your account is connected', `${e(message)}<br/><br/>Copy your UID and insert it into the private-owner Firestore rules from <strong>firestore.rules</strong>. Publish those rules in Firebase Console, then retry.`,
    `<div class="auth-actions"><button class="auth-primary" data-auth-action="retry">Retry access</button><button class="auth-secondary" data-auth-action="signout">Switch account</button></div>`,userInfo());
}
function ready(){authRoot.hidden=true;authRoot.innerHTML='';}
function signedOut() {
  card('Your collection, securely stored.', 'Sign in with Google to open your private game collection. Only the owner UID defined in Firestore rules can access game records.',
    `<div class="auth-actions"><button class="auth-primary" data-auth-action="signin">Continue with Google</button></div><div class="auth-footnote">GameVault · PlayStation · Nintendo · PC</div>`);
}
function notifyGames(games){window.dispatchEvent(new CustomEvent('gv:games',{detail:{games}}));}
function fingerprint(x){const o=Object.fromEntries(Object.entries(x||{}).filter(([,v])=>v!==null&&v!==undefined));return JSON.stringify(o,Object.keys(o).sort());}
function gameRef(g){return doc(db,'users',currentUser.uid,'games',g.id);}
function startListening(){
  if(unsubscribe)unsubscribe();
  authorized=false;
  card('Loading your private library','Checking owner permissions and downloading your games from Firestore...', '', userInfo());
  const ref=collection(db,'users',currentUser.uid,'games');
  unsubscribe=onSnapshot(ref, snap=>{
    authorized=true;
    serverDocs = new Map(snap.docs.map(d=>[d.id,d.data()]));
    notifyGames(snap.docs.map(d=>({...d.data(),id:d.id})));
    ready();
  },err=>{locked(err.code==='permission-denied'?'Your database is still locked. The Google login worked, but Firestore has not authorized this UID.':`Could not read your collection (${err.code||'network error'}).`);});
}
function normalizeGame(g){
  if(!g||typeof g!=='object'||!/^[-a-zA-Z0-9_]{1,120}$/.test(String(g.id)))throw new Error('Invalid game ID.');
  if(!platforms.has(g.platform))throw new Error('Unsupported platform.');
  if(!g.physical&&!g.digital)throw new Error('At least one ownership format is required.');
  const permitted=['id','catalogKey','title','platform','physical','digital','physicalEdition','digitalEdition',
    'year','publisher','developer','genre','notes','coverUrl','coverVerified','review','ps5Compatible',
    'createdAt','updatedAt','deletedAt'];
  const out={};
  for(const k of permitted){if(g[k]!==undefined&&g[k]!==null)out[k]=g[k];}
  if(!out.title && !out.catalogKey)throw new Error('Game title is missing.');
  if(JSON.stringify(out).length>30000)throw new Error('Game record is too large.');
  return out;
}
async function saveNow(games){
  if(!currentUser||!authorized)throw new Error('Sign in and authorize your owner UID first.');
  const normalized=games.map(normalizeGame);
  const changes=normalized.filter(g=>fingerprint(g)!==fingerprint(serverDocs.get(g.id)));
  if(!changes.length)return;
  for(let i=0;i<changes.length;i+=350){
    const batch=writeBatch(db);
    changes.slice(i,i+350).forEach(g=>batch.set(gameRef(g),g));
    await batch.commit();
  }
}
window.GVCloud={
  save(games){const task=pending.then(()=>saveNow(games));pending=task.catch(()=>{});return task;},
  reload(){if(currentUser)startListening();},
  getUser(){return currentUser;}
};

authRoot.addEventListener('click',async ev=>{
  const button=ev.target.closest('[data-auth-action]');if(!button)return;
  const action=button.dataset.authAction;
  if(action==='copy-uid'&&currentUser){
    try{await navigator.clipboard.writeText(currentUser.uid);button.textContent='Copied ✓';}
    catch{button.textContent='Select the UID above to copy';}
  }
  if(action==='retry'&&currentUser)startListening();
  if(action==='signout')await signOut(auth);
  if(action==='signin'){
    button.disabled=true;
    button.textContent='Opening Google...';
    try{await setPersistence(auth,browserLocalPersistence);await signInWithPopup(auth,new GoogleAuthProvider());}
    catch(error){signedOut();const p=authRoot.querySelector('p');if(p)p.textContent=error?.code==='auth/popup-closed-by-user'?'Sign-in window closed. Try again.':`Sign-in failed: ${error?.message||'Please try again.'}`;}
  }
});
document.getElementById('account-button')?.addEventListener('click',()=>{
  if(!currentUser){signedOut();return;}
  card('Signed in to GameVault','Your game collection is private and synchronized through Firebase.',
    `<div class="auth-actions"><button class="auth-primary" data-auth-action="back">Back to Library</button><button class="auth-secondary" data-auth-action="signout">Sign out</button></div>`,userInfo());
});
authRoot.addEventListener('click',ev=>{if(ev.target.closest('[data-auth-action="back"]'))ready();});
onAuthStateChanged(auth,user=>{
  if(unsubscribe){unsubscribe();unsubscribe=null;}
  currentUser=user;
  authorized=false;
  serverDocs=new Map();
  notifyGames([]);
  if(user)startListening();else signedOut();
},err=>card('Authentication unavailable',e(err?.message||'Please refresh and try again.')));
