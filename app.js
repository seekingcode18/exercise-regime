'use strict';
const $ = s => document.querySelector(s);
const paths = {
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v5m10-5v5M3 11h18"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>', chevron:'<path d="m9 5 7 7-7 7"/>',
 plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="m6 6 12 12M6 18 18 6"/>',
 strength:'<g transform="rotate(-35 12 12)"><path d="M8 12h8"/><rect x="4" y="6" width="4" height="12" rx="1.5"/><rect x="16" y="6" width="4" height="12" rx="1.5"/><path d="M2 9v6m20-6v6"/></g>',
 walk:'<circle cx="14" cy="4" r="1.7"/><path d="m8 21 3-6 1-6 3 4 4 1M6 12l3-4 4-1m-2 7 4 3 2 5"/>',
 optional:'<path d="M5 19c-2-9 3-15 15-15 0 11-5 16-13 14m-3 4L15 11"/>',
 scale:'<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 8a7 7 0 0 1 10 0l-3 4h-4zM12 11l2-4"/>',
 play:'<path d="m7 4 13 8-13 8z" fill="currentColor" stroke="none"/>',
 check:'<path d="m4 12 5 5L20 6"/>',book:'<path d="M3 5q5-2 9 1 4-3 9-1v14q-5-2-9 1-4-3-9-1zM12 6v14"/>'
};
function icon(n,extra=''){return `<svg aria-hidden="true" class="ic ${extra}" viewBox="0 0 24 24">${paths[n]||''}</svg>`}
function iso(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function date(key){return new Date(key+'T12:00:00')}
function fmt(d,opts){return d.toLocaleDateString('en-GB',opts)}
function monday(){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d}
function shift(d,n){const v=new Date(d);v.setDate(v.getDate()+n);return v}
const key='dayform.personal.v1';
let data;try{data=JSON.parse(localStorage.getItem(key))}catch{}
if(!data||!Array.isArray(data.log))data={start:iso(),log:[],active:null};
let noticeTimer;
function notify(msg){$('#notice').textContent=msg;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').textContent='',3500)}
function save(){try{localStorage.setItem(key,JSON.stringify(data));return true}catch{notify('Browser storage is unavailable. Changes last for this visit.');return false}}
save();
const ex=(name,dose,cue)=>({name,dose,cue});
const squat=ex('Chair squat','8–12 reps','Stand in front of a sturdy chair. Sit back, touch the seat lightly and stand tall. When ready, hold one dumbbell close to your chest.');
const push=ex('Incline press-up','6–10 reps','Use a fixed kitchen counter or wall. Keep your body in one line and lower your chest towards your hands. A higher surface feels easier.');
const row=ex('Supported one-arm row','8–12 per side','Brace one hand on a fixed counter, hinge at the hips and pull a closed backpack by its strong handle towards your hip. A dumbbell works too.');
const bug=ex('Dead bug','5–8 per side','Lie on your back with knees bent and arms up. Slowly reach opposite arm and heel away. Shorten the reach if your back starts to arch.');
const hinge=ex('Hip hinge','8–12 reps','With soft knees, push your hips back towards a wall behind you. Stand tall. Once comfortable, hold a dumbbell in each hand close to your thighs.');
const bridge=ex('Glute bridge','8–12 reps','Lie on your back with feet flat. Press through your feet, lift your hips and pause briefly. Lower with control.');
const hang=ex('Foot-assisted hang','2 × 10–20 seconds','Use a securely fitted, weight-rated bar and a stable step. Keep feet lightly supported and stop before grip fades. Rest about a minute between holds.');

const movementGuides = {
 'Chair squat': {
   file: 'chair-squat',
   steps: ['Stand just in front of a sturdy chair.', 'Sit back to touch the seat, then stand.'],
   alt: 'Side views of a standing person and a squat with hips back over the chair and both feet flat.'
 },
 'Incline press-up': {
   file: 'incline-press-up',
   steps: ['Place your hands on a fixed counter and step back.', 'Bend your elbows to lower your chest, then press away.'],
   alt: 'Side views of a straight body inclined towards a counter, first with straight arms, then with bent elbows.'
 },
 'Supported one-arm row': {
   file: 'supported-row',
   steps: ['Brace one hand and let the weight hang.', 'Draw your elbow towards your hip, then lower slowly.'],
   alt: 'The torso stays hinged and one hand stays on the counter as the other hand draws the weight up beside the waist.'
 },
 'Dead bug': {
   file: 'dead-bug',
   steps: ['Reach up with knees bent and shins level.', 'Reach one arm and the opposite heel away. Return and switch.'],
   alt: 'A person lying on their back holds both legs bent, then extends one leg and the opposite arm while the other limbs stay still.'
 },
 'Hip hinge': {
   file: 'hip-hinge',
   steps: ['Stand tall with your knees soft.', 'Send your hips back and tip forwards. Stand tall again.'],
   alt: 'Side views show an upright stance followed by a hip hinge with hips back, knees slightly bent and the spine long.'
 },
 'Glute bridge': {
   file: 'glute-bridge',
   steps: ['Lie on your back, knees bent and feet flat.', 'Press through your feet to lift your hips, then lower.'],
   alt: 'A person lying on the floor lifts the pelvis until shoulders, hips and knees form a sloping line.'
 },
 'Foot-assisted hang': {
   file: 'assisted-hang',
   steps: ['Stand on the step and grip the fitted bar.', 'Let your arms lengthen, keeping weight through your feet.'],
   alt: 'A person grips the overhead doorway bar, then bends the knees slightly, keeping both feet supported by a step.'
 },
 'Easy standing march': {
   file: 'march',
   steps: ['Stand tall with your feet under your hips.', 'Lift one knee and swing the opposite arm. Lower and switch.'],
   alt: 'A standing figure lifts one knee and swings the opposite arm forwards.'
 },
 'Shoulder circles': {
   file: 'shoulder-circles',
   steps: ['With your arms loose, lift your shoulders gently.', 'Roll your shoulders back and let them settle.'],
   alt: 'Side views show the shoulder rising, then moving back and down along the arrow.'
 },
 'Ankle circles': {
   file: 'ankle-circles',
   steps: ['Sit on a chair and lift one foot clear of the floor.', 'Trace a small circle with your toes. Reverse and switch feet.'],
   alt: 'A seated person keeps the lower leg still while the raised foot turns through two angles.'
 },
 'Hip circles': {
   file: 'hip-circles',
   steps: ['Stand with feet apart and knees soft.', 'Trace a small circle with your hips. Reverse direction.'],
   alt: 'A standing figure moves the hips in a small circle with both feet planted.'
 },
 'Arm circles': {
   file: 'arm-circles',
   steps: ['Lift your arms out to the sides at a comfortable height.', 'Draw small circles with your hands, then reverse.'],
   alt: 'Extended arms and curved arrows show the hands making small circles from the shoulders.'
 },
 'Commute walk': {
   file: 'walking',
   steps: ['Step forwards with your shoulders relaxed.', 'Roll through your foot as the other leg swings forwards.'],
   alt: 'Side views show a comfortable walking stride and the shift of weight onto the front leg.'
 }
};
Object.assign(movementGuides, {
 'Goblet squat': {
   file: 'goblet-squat',
   steps: ['Hold one dumbbell close to your chest with both hands.', 'Bend your hips and knees, then push the floor away to stand.'],
   alt: 'Side views show the dumbbell staying at chest height as the hips and knees bend into a squat.'
 },
 'Dumbbell floor press': {
   file: 'floor-press',
   steps: ['Lie back with feet flat, elbows bent and palms facing in.', 'Press the weights over your chest, then lower your upper arms gently to the floor.'],
   alt: 'A person on their back presses two dumbbells from bent elbows to straight arms over the chest.'
 },
 'Dumbbell row': {...movementGuides['Supported one-arm row']},
 'Suitcase march': {
   file: 'suitcase-march',
   steps: ['Stand tall with one dumbbell at your side.', 'March with small steps. Keep your shoulders level and repeat for the same time with the other hand.'],
   alt: 'A standing figure carries one dumbbell beside the thigh and lifts the opposite knee while keeping the torso upright.'
 },
 'Dumbbell Romanian deadlift': {
   file: 'dumbbell-rdl',
   steps: ['Stand with a dumbbell in each hand against the front of your thighs.', 'Send your hips back and slide the weights close to your legs. Stand tall again.'],
   alt: 'Side views show an upright figure and a hip hinge with the dumbbells hanging close to the shins.'
 },
 'Seated shoulder press': {
   file: 'seated-press',
   steps: ['Sit tall with feet planted and the weights by your shoulders.', 'Press overhead as far as feels comfortable, then lower slowly.'],
   alt: 'A seated figure presses two dumbbells from shoulder height to above the shoulders, keeping the feet on the floor.'
 },
 'Hammer curl': {
   file: 'hammer-curl',
   steps: ['Stand with one dumbbell at each side, palms facing in.', 'Bend your elbows to raise the weights, then lower them without swinging.'],
   alt: 'Two views show the arms moving from straight to bent, with the dumbbells lifted towards the shoulders and the elbows by the ribs.'
 }
});
const mobilityMoves = ['Shoulder circles', 'Ankle circles', 'Hip circles'];
const warmupMoves = ['Easy standing march', 'Arm circles', 'Chair squat'];

function movementFigure(name, showName = false) {
 const guide = movementGuides[name];
 const heading = showName ? '<h4>' + name + '</h4>' : '';
 return `<div class="movement-figure">
   ${heading}
   <figure class="movement-frame">
     <img src="movements/${guide.file}.svg" alt="${guide.alt}" width="600" height="200" loading="lazy">
     <figcaption>${guide.steps.map((step, i) => `<span><b>${i + 1}</b>${step}</span>`).join('')}</figcaption>
   </figure>
 </div>`;
}
function exerciseFigures(name) {
 if (name === 'Gentle mobility') return mobilityMoves.map(move => movementFigure(move, true)).join('');
 return movementFigure(name);
}
function illustratedWarmup() {
 return `<details class="movement-disclosure"><summary>Warm-up illustrations</summary>
   ${warmupMoves.map(move => movementFigure(move, true)).join('')}
 </details>`;
}

const sessions={
 A:{label:'Session A',name:'Full-body foundations',first:'Full-body',last:'foundations',type:'strength',duration:'15–20 min',summary:'Squat, push and pull, then finish with core control.',moves:[squat,push,row,bug]},
 B:{label:'Session B',name:'Hinge & build',first:'Hinge',last:'& build',type:'strength',duration:'15–20 min',summary:'Practise a hip hinge, train your upper body and build hip strength.',moves:[hinge,row,push,bridge]},
 C:{label:'Optional session',name:'Grip & mobility',first:'Grip',last:'& mobility',type:'optional',duration:'15 min',summary:'An easy third session for weeks when you feel recovered. Keep your feet supported for the hangs.',moves:[ex('Easy standing march','2–3 minutes','Start slowly, then let your arms swing as you find a comfortable rhythm.'),hang,bug,ex('Gentle mobility','3–5 minutes','Move slowly through shoulder circles, ankle circles and gentle hip rotations. Stay within a comfortable range.')]}
};
const weightedRow = ex('Dumbbell row','8–12 per side','Support one hand on a fixed counter. Keep your torso still as you pull one dumbbell towards your hip. Complete both sides.');
sessions.D = {
 slot:'A', label:'Dumbbell A', name:'Squat & press', first:'Squat', last:'& press',
 type:'strength', duration:'15–20 min',
 summary:'Use this on your Session A day. A squat, floor press and row work your whole body. Finish with a short one-sided march.',
 moves:[
   ex('Goblet squat','8–12 reps','Hold a single dumbbell securely at chest height, using a grip suited to its design. Keep your heels down and squat to a depth you can control.'),
   ex('Dumbbell floor press','8–12 reps','Start seated with the weights on your thighs, then ease onto your back with the weights close. Keep wrists above elbows. Pause gently when the upper arms meet the floor.'),
   weightedRow,
   ex('Suitcase march','15–30 sec per hand','Use one dumbbell. Alternate small knee lifts and breathe steadily. Stop the set if you start leaning. Do the same time with each hand.')
 ]
};
sessions.E = {
 slot:'B', label:'Dumbbell B', name:'Hinge & pull', first:'Hinge', last:'& pull',
 type:'strength', duration:'15–20 min',
 summary:'Use this on your Session B day. Train your hips with a weighted hinge, then work your shoulders, back and arms.',
 moves:[
   ex('Dumbbell Romanian deadlift','8–12 reps','Use one dumbbell per hand. With soft knees, push your hips back until you feel a stretch at the backs of your thighs. Keep your back long and the weights close.'),
   ex('Seated shoulder press','8–12 reps','Use a sturdy chair and a light dumbbell in each hand. Keep your ribs over your hips. If the lightest setting makes you lean back, use the original incline press-up.'),
   weightedRow,
   ex('Hammer curl','8–12 reps','Keep your thumbs pointing up and your elbows close to your sides. Choose a light enough pair that you can lower both weights smoothly.')
 ]
};
const slots = ['A','B','C'];
const weightedVersions = {A:'D', B:'E'};
function preferredSession(slot) {
 const weighted = weightedVersions[slot];
 return weighted && data.versions?.[slot] === weighted ? weighted : slot;
}
function versionPicker(id) {
 const slot = sessions[id].slot || id;
 if (!weightedVersions[slot]) return '';
 const versions = [[slot, 'Original'], [weightedVersions[slot], 'With dumbbells']];
 return `<fieldset class="version-picker"><legend>Equipment for Session ${slot}</legend>
   ${versions.map(([version,label]) => `<button type="button" data-version="${version}" aria-pressed="${id===version}">${label}</button>`).join('')}
   <small>Your choice appears on your weekly schedule.</small><button type="button" class="link guide-jump" data-progression>When to add weight ${icon('arrow')}</button></fieldset>`;
}
function progressionGuide() {
 return `<article class="card progression" id="load-guide" tabindex="-1"><h2>Increasing your weights</h2>
   <ol><li><strong>Find your starting load for each lift.</strong> Try the lightest setting. Aim for 8 smooth reps with about 2 more possible. If the lightest setting feels too heavy, practise the original movement or use a lighter weight. Your legs may be ready for more than your shoulders.</li>
   <li><strong>Build reps first.</strong> Keep the load steady and add a rep when it feels manageable. Work towards 12 on every set. For a one-sided lift, let your weaker side set the pace.</li>
   <li><strong>Then take the smallest step.</strong> Once every set reaches 12 with about 2 reps in reserve on two sessions in a row, try the next setting and return to 8. If you need momentum or cannot manage 8 clean reps, return to the previous load.</li></ol>
   <p><strong>A row example</strong><br>At 5 kg, work from 8 to 10 to 12 reps per side over several sessions. After two comfortable sessions at 12 on all sets, try 5.5 kg for 8 if your dumbbell has that setting.</p>
   <details><summary>When the jump is too big or your heaviest weight feels easy</summary><p>Keep the current load and build towards 15 controlled reps, or add a second set if it fits your 20 minutes. Once those are easy, a pair with a higher maximum and small increments gives your stronger lifts room to grow.</p></details>
   <details><summary>Progressing the suitcase march</summary><p>Start at 15 seconds per hand. Gradually build to 30 with level shoulders. When that feels steady twice in a row, try the next small weight increase and return to 15 seconds.</p></details>
   <a class="source" href="https://pubmed.ncbi.nlm.nih.gov/19204579/" target="_blank" rel="noreferrer">ACSM guidance on progressing resistance training ↗</a>
 </article>`;
}
function schedule(){
 const f=data.profile?.frequency;
 if(f===choices.frequency[1])return ['W','W',sessions[nextSession()]?.slot||nextSession(),'W','W','W','W'];
 return [f===choices.frequency[2]?'W':'C','W','A','W','W','B','W'];
}
const dayLabel=i=>['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i];
let selectedDay=(new Date().getDay()+6)%7,planId=preferredSession('A'),page='overview',ticker=null;
const latest=()=>data.log.filter(x=>x.kind==='weight').sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id)[0]?.value??data.profile?.weight??null;
function nextSession(){if(data.active)return data.active.id;const last=data.log.filter(x=>x.kind==='session'&&x.session!=='C').sort((a,b)=>b.id-a.id)[0];const previous=sessions[last?.session];return preferredSession((previous?.slot||last?.session)==='A'?'B':'A')}
function weightBox(){
 const current=latest(),start=data.profile?.weight,target=data.profile?.target;
 const pc=start!=null&&target!=null&&target!==start&&current!=null?Math.max(0,Math.min(100,(current-start)/(target-start)*100)):0;
 return `<div class="card"><h2>Weight journal</h2><div class="value"><strong>${current?.toFixed(1)??'—'}</strong><span>kg</span></div><p class="quiet">${current==null?'Add your first weigh-in.':'Latest weight'}</p>
 ${start!=null&&target!=null?`<div class="goalbar"><i style="width:${pc}%"></i></div><div class="bounds"><span>${start} kg start</span><span>${target} kg goal</span></div>`:''}
 <div class="goalbtm"><a class="link" href="#profile">Edit profile</a><button class="link" data-log="weight">Log weight</button></div></div>`;
}
function cards() {
 return slots.map(slot => {
   const id = preferredSession(slot);
   const session = sessions[id];
   return `<button class="sessioncard" data-plan="${id}"><span class="iconbox ${session.type}">${icon(session.type)}</span>
     <span><strong>${session.name}</strong><small>${session.label} · ${session.duration}</small></span>${icon('chevron','last')}</button>`;
 }).join('');
}
function sessionTabs() {
 const activeSlot = sessions[planId].slot || planId;
 return `<div class="tabs" aria-label="Training days">${slots.map(slot =>
   `<button data-plan="${preferredSession(slot)}" aria-pressed="${activeSlot===slot}" class="${activeSlot===slot?'selected':''}">${sessions[slot].label}</button>`
 ).join('')}</div>`;
}
function dayInfo(){const id=preferredSession(schedule()[selectedDay]),s=sessions[id];return `<strong>${dayLabel(selectedDay)} <span aria-hidden="true">·</span> ${s?s.name:'Walk'}</strong>${s?`<button class="link" data-plan="${id}">View session ${icon('arrow')}</button>`:`<button class="link" data-log="walk">Log walk ${icon('plus')}</button>`}`}
function week(){const mon=monday();return `<div class="card"><div class="cardtop"><h2>Sample week</h2><span class="quiet">${fmt(mon,{day:'numeric',month:'short'})} – ${fmt(shift(mon,6),{day:'numeric',month:'short'})}</span></div><div class="week">${schedule().map((id,i)=>{const s=sessions[preferredSession(id)],type=s?.type||'walk';return `<button class="day" data-day="${i}" aria-pressed="${i===selectedDay}" aria-label="${dayLabel(i)}, ${s?.name||'walk'}"><span>${dayLabel(i)}</span><strong>${shift(mon,i).getDate()}</strong><span class="tileicon ${type}">${icon(type)}</span></button>`}).join('')}</div><div class="weekinfo">${dayInfo()}</div></div>`}
function intro(title,sub,aside=''){return `<div class="intro"><div><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>${aside}</div>`}
function dashboard(){const id=nextSession(),s=sessions[id];return intro('Training overview','Your strength sessions, walking routine and progress in one place.',`<span class="date">${icon('calendar')}${fmt(new Date(),{weekday:'long',day:'numeric',month:'long'})}</span>`)+`<div class="card profile-summary"><div class="cardtop"><h2>${data.profile?'Your plan':'Make this plan yours'}</h2><a class="link" href="#profile">${data.profile?'Edit profile':'Set up profile'} →</a></div><p>${data.profile?weeklyAdvice():'Enter your goals, equipment and available time to personalise your sessions.'}</p></div><section class="hero"><div><div class="eyebrow">${icon('strength')} Up next &nbsp; / &nbsp; ${s.label}</div><h2>${s.first}<br>${s.last}</h2><div class="meta"><span>${icon('clock')}${s.duration}</span><span>${icon('grid')}${s.moves.length} exercises</span></div><div class="actions"><button class="action" data-start="${id}">${icon('play')}${data.active?'Resume':'Start'} session</button><button class="link preview-moves" data-plan="${id}">Preview exercises ${icon('arrow')}</button></div></div></section><div class="dashgrid">${week()}${weightBox()}</div><div class="sectiontitle"><h2>Your sessions</h2><a class="link" href="#plan">View training plan ${icon('arrow')}</a></div><div class="sessiongrid">${cards()}</div>`}
function sessionRows(session) {
 return session.moves.map((move, index) => `<section class="illustrated-move">
   <div class="move-heading">
     <span class="number">${String(index + 1).padStart(2,'0')}</span>
     <h3>${move.name}</h3><span class="move-dose">${move.dose}</span>
   </div>
   ${exerciseFigures(move.name)}
   <p class="move-cue">${move.cue}</p>
 </section>`).join('');
}
function training(){const s=sessions[planId],c=planId==='C';return intro('Training plan','Two short strength sessions, with room for a lighter third.')+`${sessionTabs()}${versionPicker(planId)}<div class="contentgrid"><article class="exercise-list"><div class="eyebrow">${icon(s.type)} ${s.label} · ${s.duration}</div><h2 style="margin-top:9px">${s.name}</h2><p>${s.summary}</p><p class="sub">${c?'Work through once at an easy pace.':'Warm up with 2–3 minutes of marching, arm circles and easy squats. Do one round to start. Rest 30–60 seconds between moves, longer if needed. Build to two rounds within 20 minutes.'}</p>${c?'':illustratedWarmup()}<div class="illustrated-list">${sessionRows(s)}</div><button class="action" data-start="${planId}">${icon('play')}${data.active?.id===planId?'Resume':'Start'} session</button></article><aside class="stack">${progressionGuide()}<div class="card"><h2>Your week</h2><p>${weeklyAdvice()}</p><p>${walkingAdvice()}</p></div></aside></div>`}
function guide(){return intro('Field guide','Practical notes for training and eating around a busy week.')+`<div class="contentgrid"><div class="stack"><article class="guide-section"><div class="eyebrow">${icon('strength')} Training at home</div><h2>Choosing your weights</h2><p>Adjustable dumbbells let you change the load in small steps. Choose a range you can control.</p><p>Look for small increments, secure weight locks and a comfortable grip. Different exercises will need different loads. Start light, aim for smooth reps and adjust each side equally. You can use a chair, a fixed counter and a securely closed backpack for the programme now.</p><details open><summary>Practising a supported hang</summary>${movementFigure('Foot-assisted hang')}<p>${data.profile?.hang>0?'Your recorded comfortable hold is '+data.profile.hang+' seconds. Keep practice holds within that time.':'Start with two short, foot-supported holds.'} When both feel comfortable for two sessions, add a third hold or reduce foot support a little. Change one thing at a time.</p><p>Check the doorway, fit and bar rating against the manufacturer's instructions before each use. Step down while your grip is secure. Stop if your shoulders or elbows hurt.</p></details></article><article class="guide-section"><div class="eyebrow">${icon('walk')} Walking</div><h2>Walking routine</h2>${movementFigure('Commute walk')}<p>At moderate intensity you can talk but singing would be difficult. ${walkingAdvice()}</p><a class="source" href="https://www.nhs.uk/live-well/exercise/physical-activity-guidelines-for-adults-aged-19-to-64/" target="_blank" rel="noreferrer">NHS adult activity guidelines ↗</a></article></div><div class="stack"><article class="guide-section"><div class="eyebrow">${icon('optional')} Nutrition</div><h2>Meals that fit</h2><p>${meals()}</p><a class="source" href="https://www.nhs.uk/better-health/lose-weight/healthy-eating-when-trying-to-lose-weight/" target="_blank" rel="noreferrer">NHS healthy eating guide ↗</a></article>${progressionGuide()}<div class="card"><h3>Training comfortably</h3><p>Start with pain-free movements. If an injury or health condition affects how you exercise, get individual advice from a clinician or physiotherapist.</p><a class="source" href="https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/" target="_blank" rel="noreferrer">NHS strength guidance ↗</a></div></div></div>`}
function trend(){
 const weights=[...(data.profile?.weight!=null?[{date:data.start,value:data.profile.weight,id:0}]:[]),...data.log.filter(x=>x.kind==='weight')].sort((a,b)=>a.date.localeCompare(b.date)||a.id-b.id);
 if(!weights.length)return '<div class="card"><h2>Weight trend</h2><p>Add a weigh-in to start your chart.</p></div>';
 const byDay=[...new Map(weights.map(x=>[x.date,x])).values()];
 const min=Math.min(...byDay.map(x=>x.value))-1,max=Math.max(...byDay.map(x=>x.value))+1;
 const first=date(byDay[0].date),last=date(byDay.at(-1).date);
 const points=byDay.map(x=>[10+(date(x.date)-first)/Math.max(1,last-first)*380,104-(x.value-min)/(max-min)*88]);
 return `<div class="card"><h2>Weight trend</h2><p class="quiet">${byDay.length===1?'Your first point is in. Weigh in on another day to see your trend.':'Daily points show the latest weigh-in for each date.'}</p><svg class="chart" role="img" aria-label="Weight trend from ${byDay[0].value} to ${byDay.at(-1).value} kilograms" viewBox="0 0 400 120" preserveAspectRatio="none"><path d="M0 20H400M0 60H400M0 100H400" stroke="#e2e6db" stroke-dasharray="4 5"/><polyline points="${points.map(p=>p.join(',')).join(' ')}"/>${points.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</svg><div class="bounds"><span>${fmt(first,{day:'numeric',month:'short'})}</span><span>${fmt(last,{day:'numeric',month:'short'})}</span></div></div>`
}
function progress(){
 const mon=iso(monday()),week=data.log.filter(x=>x.date>=mon&&x.date<=iso());
 const stats=[['Strength',week.filter(x=>x.kind==='session'&&x.session!=='C').length,(data.profile?.frequency===choices.frequency[1]?' / 1':' / 2'),'sessions this week'],['Walking',week.filter(x=>x.kind==='walk').reduce((n,x)=>n+x.value,0),' min','logged this week'],['Weight',latest()?.toFixed(1)??'—',' kg','latest weigh-in']];
 const items=[...data.log].sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
 return intro('Your progress','A record of your sessions, walks and weigh-ins.',`<div class="actions"><button class="smallbtn" data-log="walk">${icon('plus')} Log walk</button><button class="action" data-log="weight">${icon('plus')} Log weight</button></div>`)+`<div class="statgrid">${stats.map(([label,v,u,cap])=>`<div class="card"><div class="overline">${label}</div><div class="value"><strong>${v}</strong><span>${u}</span></div><div class="caption">${cap}</div></div>`).join('')}</div><div class="contentgrid"><div class="stack">${trend()}<div class="card"><h2>Activity history</h2>${items.length?items.map(x=>{const type=x.kind==='session'?sessions[x.session].type:x.kind==='walk'?'walk':'scale';const title=x.kind==='session'?sessions[x.session].name:x.kind==='walk'?'Walk':'Weigh-in';return `<div class="history-item"><div class="boxhead"><span class="iconbox ${type}">${icon(type)}</span><div><strong>${title}</strong><small>${fmt(date(x.date),{day:'numeric',month:'short',year:'numeric'})}</small>${savedLifts(x)}</div></div><span>${x.kind==='session'?'Completed':x.value+(x.kind==='weight'?' kg':' min')}</span></div>`}).join(''):'<p class="empty">Complete a session or log your first walk or weigh-in here.</p>'}</div></div><aside class="stack">${weightBox()}<div class="card"><h3>About your journal</h3><p>Entries and your active session are saved in this browser on this device.</p></div></aside></div>`
}
function render(){
 const dest=location.hash.slice(1);page=['plan','progress','guide','profile'].includes(dest)?dest:'overview';
 const views={overview:dashboard,plan:training,progress,guide,profile:profilePage};
 $('#main').innerHTML=views[page]();document.querySelectorAll('nav a').forEach(a=>{if(a.hash==='#'+page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 document.title=`${{overview:'Training overview',plan:'Training plan',progress:'Your progress',guide:'Field guide',profile:'Your profile'}[page]} · Dayform`;
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
function openModal(label,body){$('#dialogContent').innerHTML=`<header><span class="overline">${label}</span><button class="close" aria-label="Close dialog" data-close>${icon('x')}</button></header>${body}`;$('#dialog').setAttribute('aria-labelledby','modalTitle');if(!$('#dialog').open)$('#dialog').showModal()}
$('#dialog').addEventListener('close',()=>{clearInterval(ticker);ticker=null;render()});
function openLog(kind){const w=kind==='weight';openModal('Progress journal',`<h2 id="modalTitle">Log ${w?'weight':'a walk'}</h2><form class="form" data-form="${kind}"><label>${w?'Weight (kg)':'Walking time (minutes)'}<input type="number" name="value" step="${w?'0.1':'1'}" min="${w?'1':'1'}" max="${w?'500':'1440'}" required value="${w?(latest()??''):''}"></label><label>Date<input type="date" name="date" max="${iso()}" required value="${iso()}"></label><button class="action" type="submit">Save ${w?'weight':'walk'}</button></form>`)}
const elapsed=a=>a.elapsed+(a.since===null?0:Math.max(0,Date.now()-a.since));
function showTime(){if(!data.active||!$('#time'))return;const t=Math.floor(elapsed(data.active)/1000);$('#time').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0')}
function escapeText(value) {
 const entities = {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'};
 return String(value).replace(/[&<>"']/g, char => entities[char]);
}
function liftNotes(move, index) {
 const last = data.log.slice().reverse().find(entry => entry.kind === 'session' && entry.lifts?.[move.name]);
 const prior = last ? `<small>Last time · ${escapeText(last.lifts[move.name])}</small>` : '';
 const example = move.name === 'Suitcase march' ? '4 kg, 20 seconds each side' : '5 kg per dumbbell, 10 and 9 reps';
 return `<div class="lift-entry"><label for="lift-${index}">Weight &amp; ${move.name === 'Suitcase march'?'time':'reps'} <span>(optional)</span></label>
   <input id="lift-${index}" data-lift="${index}" maxlength="100" placeholder="${example}" value="${escapeText(data.active.lifts?.[move.name] || '')}">
   ${prior}</div>`;
}
function savedLifts(entry) {
 const notes = sessions[entry.session]?.moves.filter(move => entry.lifts?.[move.name]) || [];
 if (!notes.length) return '';
 return `<details class="past-lifts"><summary>Weights &amp; reps</summary>
   <ul>${notes.map(move => `<li><strong>${move.name}</strong> · ${escapeText(entry.lifts[move.name])}</li>`).join('')}</ul></details>`;
}
function workout(){
 const a=data.active,s=sessions[a.id];
 openModal(s.label,`<h2 id="modalTitle">${s.name}</h2><p class="quiet">${s.duration} · ${s.moves.length} exercises</p><div class="timerbox"><div><div class="overline">Session time</div><span class="timer" id="time"></span></div><button class="smallbtn" data-pause>${a.since===null?'Resume timer':'Pause timer'}</button></div><p>${a.id==='C'?'Keep the effort easy. Check off each movement when finished.':'Warm up for 2–3 minutes. Complete one round, or two if comfortable. Rest 30–60 seconds as needed. Check each move after your final round.'}</p>${a.id==='C'?'':illustratedWarmup()}
 <div class="checks">${s.moves.map((m,i)=>`<div class="workout-move">
   <label><input type="checkbox" data-check="${i}" ${a.done.includes(i)?'checked':''}>
     <span><strong>${m.name}</strong> · ${m.dose}<small>${m.cue}</small></span>
   </label>
   <details class="movement-disclosure"><summary>View movement<span class="sr"> for ${m.name}</span></summary>${exerciseFigures(m.name)}</details>
   ${s.slot ? liftNotes(m,i) : ''}
 </div>`).join('')}</div><div class="actions" style="margin-top:18px"><button class="action" data-finish ${a.done.length===s.moves.length?'':'disabled'}>${icon('check')} Finish session</button><button class="link" data-discard>Discard session</button></div>`);
 showTime();clearInterval(ticker);ticker=setInterval(showTime,500)
}
function start(id){
 if(data.active&&data.active.id!==id){openModal('Session in progress',`<h2 id="modalTitle">${sessions[data.active.id].name} is open</h2><p>Resume your current session or discard it before starting another.</p><div class="actions" style="margin-top:18px"><button class="action" data-resume>Resume session</button><button class="link" data-discard>Discard session</button></div>`);return}
 if(!data.active){data.active={id,since:Date.now(),elapsed:0,done:[]};save()}workout()
}
document.addEventListener('submit',e=>{const f=e.target;if(!f.dataset.form)return;e.preventDefault();if(!f.reportValidity())return;if(f.dataset.form==="profile"){saveProfile(f);return}const fields=new FormData(f);data.log.push({kind:f.dataset.form,value:Number(fields.get('value')),date:fields.get('date'),id:Date.now()});const saved=save();$('#dialog').close();if(saved)notify(f.dataset.form==='weight'?'Weigh-in saved':'Walk saved')});
document.addEventListener('input', e => {
 const index = e.target.dataset.lift;
 if (index === undefined || !data.active) return;
 const move = sessions[data.active.id].moves[Number(index)];
 if (!move) return;
 data.active.lifts ||= {};
 data.active.lifts[move.name] = e.target.value.trim().slice(0,100);
 save();
});
document.addEventListener('change',e=>{const el=e.target;if(!el.hasAttribute('data-check')||!data.active)return;const i=Number(el.dataset.check);data.active.done=data.active.done.filter(n=>n!==i);if(el.checked)data.active.done.push(i);save();$('[data-finish]').disabled=data.active.done.length!==sessions[data.active.id].moves.length});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if('day' in d){selectedDay=Number(d.day);document.querySelectorAll('[data-day]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.day)===selectedDay)));$('.weekinfo').innerHTML=dayInfo()}
 else if('version' in d){
   const slot=sessions[d.version].slot||d.version;
   data.versions={...data.versions,[slot]:d.version};
   planId=d.version;save();render();
   document.querySelector('[data-version="'+planId+'"]')?.focus?.();
 }
 else if('plan' in d){planId=d.plan;if(page==='plan')render();else location.hash='plan'}
 else if('progression' in d){const guide=$('#load-guide');guide.focus();guide.scrollIntoView({block:'start'})}
 else if('log' in d)openLog(d.log);
 else if('start' in d)start(d.start);
 else if('close' in d)$('#dialog').close();
 else if('resume' in d)workout();
 else if('pause' in d){const a=data.active;if(a.since===null)a.since=Date.now();else{a.elapsed=elapsed(a);a.since=null}save();b.textContent=a.since===null?'Resume timer':'Pause timer';showTime()}
 else if('finish' in d&&data.active&&data.active.done.length===sessions[data.active.id].moves.length){data.log.push({kind:'session',session:data.active.id,date:iso(),id:Date.now(),seconds:Math.floor(elapsed(data.active)/1000),lifts:data.active.lifts});data.active=null;const saved=save();$('#dialog').close();if(saved)notify('Session complete and saved')}
 else if('discard' in d){openModal('Active session',`<h2 id="modalTitle">Discard this session?</h2><p>This removes the current timer and exercise checks.</p><div class="actions" style="margin-top:18px"><button class="action" data-resume>Keep session</button><button class="ghost" data-confirm>Discard</button></div>`)}
 else if('confirm' in d){data.active=null;save();$('#dialog').close()}
});
$('#access').innerHTML= '<a href="#profile">My profile</a>' ;render();
