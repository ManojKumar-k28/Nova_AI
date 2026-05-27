import{d as u}from"./react-DHg8MsdW.js";import{j as r}from"./motion-DagO2KPI.js";import{u as M,C as w}from"./three-tRJtZ5sx.js";import{c as v}from"./api-BCEGtvdY.js";import{c as g,s as x}from"./index-Cs06hYkc.js";/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),S=(...e)=>e.filter((i,t,a)=>!!i&&a.indexOf(i)===t).join(" ");/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var b={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=u.forwardRef(({color:e="currentColor",size:i=24,strokeWidth:t=2,absoluteStrokeWidth:a,className:s="",children:o,iconNode:n,...c},h)=>u.createElement("svg",{ref:h,...b,width:i,height:i,stroke:e,strokeWidth:a?Number(t)*24/Number(i):t,className:S("lucide",s),...c},[...n.map(([d,l])=>u.createElement(d,l)),...Array.isArray(o)?o:[o]]));/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=(e,i)=>{const t=u.forwardRef(({className:a,...s},o)=>u.createElement(A,{ref:o,iconNode:i,className:S(`lucide-${k(e)}`,a),...s}));return t.displayName=`${e}`,t};/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=f("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=f("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=f("ShieldAlert",[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}],["path",{d:"M12 8v4",key:"1got3b"}],["path",{d:"M12 16h.01",key:"1drbdi"}]]);/**
 * @license lucide-react v0.390.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=f("Sparkles",[["path",{d:"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",key:"4pj2yx"}],["path",{d:"M20 3v4",key:"1olli1"}],["path",{d:"M22 5h-4",key:"1gvqau"}],["path",{d:"M4 17v2",key:"vumght"}],["path",{d:"M5 18H3",key:"zchphs"}]]);function L(){const e=u.useRef(null),[i,t]=u.useMemo(()=>{const s=new Float32Array(6e3),o=new Float32Array(2e3*3);for(let n=0;n<2e3;n++){const c=Math.random()*25+5,h=Math.random()*Math.PI*2,d=Math.acos(Math.random()*2-1);s[n*3]=c*Math.sin(d)*Math.cos(h),s[n*3+1]=c*Math.sin(d)*Math.sin(h),s[n*3+2]=c*Math.cos(d),Math.random()>.4?(o[n*3]=.23,o[n*3+1]=.51,o[n*3+2]=.96):(o[n*3]=.91,o[n*3+1]=.92,o[n*3+2]=.98)}return[s,o]},[]);return M(a=>{e.current&&(e.current.rotation.y=a.clock.getElapsedTime()*.05,e.current.rotation.x=a.clock.getElapsedTime()*.02)}),r.jsxs("points",{ref:e,children:[r.jsxs("bufferGeometry",{children:[r.jsx("bufferAttribute",{attach:"attributes-position",args:[i,3]}),r.jsx("bufferAttribute",{attach:"attributes-color",args:[t,3]})]}),r.jsx("pointsMaterial",{size:.06,vertexColors:!0,transparent:!0,opacity:.6,sizeAttenuation:!0,depthWrite:!1})]})}function P(){return r.jsx("div",{className:"fixed inset-0 w-full h-full -z-10 pointer-events-none bg-primary",children:r.jsxs(w,{camera:{position:[0,0,15],fov:60},gl:{alpha:!0,antialias:!0},children:[r.jsx("ambientLight",{intensity:.3}),r.jsx("pointLight",{position:[10,10,10],intensity:1.5,color:"#3B82F6"}),r.jsx("pointLight",{position:[-10,-10,-10],intensity:.8,color:"#8B5CF6"}),r.jsx("pointLight",{position:[0,0,5],intensity:.5,color:"#06B6D4"}),r.jsx(L,{})]})})}const R=v((e,i)=>({sessions:[],activeSession:null,messages:[],isLoading:!1,isStreaming:!1,fetchSessions:async()=>{try{const t=await g.getSessions();e({sessions:t})}catch(t){console.error("Failed to fetch sessions:",t)}},createSession:async(t="New Conversation",a="llama-3.3-70b")=>{try{const s=await g.createSession(t,a);return e(o=>({sessions:[s,...o.sessions],activeSession:s,messages:[]})),s}catch(s){throw console.error("Failed to create session:",s),s}},loadSession:async t=>{e({isLoading:!0});try{const a=await g.getMessages(t),s=i().sessions.find(o=>o.id===t)||null;e({activeSession:s,messages:a,isLoading:!1})}catch(a){console.error("Failed to load session:",a),e({isLoading:!1})}},sendMessage:async(t,a)=>{const{activeSession:s}=i();if(!s)return;const o=`user_${Date.now()}`,n=`assistant_${Date.now()}`,c=new Date().toISOString(),h={id:o,session_id:s.id,role:"user",content:t,timestamp:c},d={id:n,session_id:s.id,role:"assistant",content:"",timestamp:c};e(l=>({messages:[...l.messages,h,d],isStreaming:!0}));try{const l=a||s.model||"llama-3.3-70b";await x(s.id,t,l,y=>{e(p=>({messages:p.messages.map(m=>m.id===n?{...m,content:m.content+y}:m)}))},async()=>{e({isStreaming:!1}),await i().fetchSessions(),await i().loadSession(s.id)})}catch(l){console.error("Failed to stream message:",l),e(y=>({isStreaming:!1,messages:y.messages.map(p=>p.id===n?{...p,content:"Error: Failed to get a response. Please check your API configuration."}:p)}))}},deleteSession:async t=>{try{await g.deleteSession(t),e(a=>{var n;const s=a.sessions.filter(c=>c.id!==t),o=((n=a.activeSession)==null?void 0:n.id)===t;return{sessions:s,activeSession:o?null:a.activeSession,messages:o?[]:a.messages}})}catch(a){console.error("Failed to delete session:",a)}},clearMessages:()=>{e({messages:[],activeSession:null})}}));export{P as B,E as L,$ as M,I as S,N as a,f as c,R as u};
