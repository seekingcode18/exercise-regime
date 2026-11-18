const profileFields = [
 ['age','Age in years (adult programme)',18,120,1],
 ['height','Height (cm)',1,300,0.1],
 ['weight','Starting weight (kg)',1,500,0.1],
 ['target','Target weight (kg)',1,500,0.1],
 ['walking','Usual moderate walking (minutes/week)',0,10080,1],
 ['hang','Current comfortable supported hang (seconds)',0,600,1],
 ['minutes','Time available per session (minutes)',1,240,1]
];
const choices = {
 goal:['Training goal','General fitness','Build strength','Weight management'],
 diet:['Eating preference','Mixed diet','Vegetarian including eggs and dairy','Plant-based'],
 kit:['Equipment','Bodyweight and household items','Dumbbells available'],
 frequency:['Weekly availability','One session','Two sessions','Three sessions']
};
function profilePage(){
 const p=data.profile||{};
 const numbers=profileFields.map(([k,title,min,max,step])=>`<label>${title}<input type="number" name="${k}" min="${min}" max="${max}" step="${step}" value="${escapeText(p[k]??'')}"></label>`).join('');
 const menus=Object.entries(choices).map(([k,[label,...opts]])=>`<label>${label}<select name="${k}"><option value="">Choose if useful</option>${opts.map(o=>`<option ${p[k]===o?'selected':''}>${o}</option>`).join('')}</select></label>`).join('');
 return intro('Your profile','Optional details for your personal training plan.')+`<form class="card form profile-form" data-form="profile"><p>Your entries stay in this browser on this device. Anyone using the same browser profile can see them. Clearing site data removes them.</p>${numbers}<label>Gender (optional)<input name="gender" maxlength="60" value="${escapeText(p.gender||'')}"></label>${menus}<p class="quiet">Height and gender are for your reference. Choose weights by how comfortably you can perform each exercise.</p><button class="action">Save profile</button></form>`;
}
function saveProfile(form){
 const values=new FormData(form),previous=data.profile||{},p={};
 for(const [k] of profileFields){const val=values.get(k);if(val!==''&&val!==null)p[k]=Number(val)}
 for(const k of [...Object.keys(choices),'gender'])p[k]=String(values.get(k)||'').trim();
 if(previous.kit!==p.kit && p.kit)data.versions=p.kit===choices.kit[2]?{A:'D',B:'E'}:{};
 if(p.weight!==previous.weight)data.start=iso();
 data.profile=p;planId=preferredSession('A');const stored=save();location.hash='overview';render();if(stored)notify('Profile saved on this device');
}
function walkingAdvice(){
 const n=data.profile?.walking;
 if(n==null)return 'Log your usual walking time to see how it contributes to the adult guideline of 150 moderate minutes a week.';
 return n>=150?'Your usual walking meets the adult moderate-activity guideline. Keep a rhythm that fits your week.':`Your usual ${n} minutes leave ${150-n} minutes to reach the adult weekly guideline. Build up by adding a short brisk walk when convenient.`;
}
function weeklyAdvice(){
 const p=data.profile||{};
 const freq=p.frequency===choices.frequency[1]?'With one day available, alternate A and B across weeks.':p.frequency===choices.frequency[3]?'Use A and B on separate days. Add the easy mobility session on your third day if recovered.':'Alternate strength sessions A and B, with a recovery day between them.';
 const time=p.minutes==null?'':p.minutes<15?` With ${p.minutes} minutes, warm up and do the movements you have time for. Resume the rotation next time.`:` With ${p.minutes} minutes available, the short sessions leave room for rests.`;
 const goal=p.goal==='Build strength'?' Record weights and reps so you can spot when a lift is ready to progress.':p.goal==='Weight management'?' Use consistent weigh-ins to follow your longer-term trend.':'';
 return freq+time+goal+(p.age>=65?' Include comfortable balance practice alongside strength and walking.':'');
}
function meals(){
 const diet=data.profile?.diet;
 if(diet===choices.diet[2])return 'Try yoghurt with oats, a chickpea and egg wrap, or lentil dhal with rice.';
 if(diet===choices.diet[3])return 'Try fortified soya yoghurt with oats, a hummus wrap, or tofu and vegetables with rice.';
 if(diet===choices.diet[1])return 'Try yoghurt with oats, a bean salad, or fish with vegetables and potatoes.';
 return 'Choose a protein source you enjoy at meals, alongside vegetables and grains or potatoes. Set an eating preference in your profile for meal ideas.';
}
