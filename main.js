
// Thomas Racer - Simple top-down lane runner
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const muteBtn = document.getElementById('muteBtn');
const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const boostBtn = document.getElementById('boost');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');

let W = canvas.width, H = canvas.height;
let running = false;
let lastTime = 0;
let spawnTimer = 0;
let obstacles = [];
let powerups = [];
let score = 0;
let lives = 3;
let speed = 2;
let boost = false;
let mute = false;

const lanes = [W*0.2, W*0.5, W*0.8];
const player = {
  lane: 1,
  y: H - 120,
  width: 80,
  height: 80,
  img: null
};

const assets = {};
// load player image
function loadAssets(cb){
  let img = new Image();
  img.src = 'assets/player.png';
  img.onload = () => { assets.player = img; cb(); };
  // music
  assets.music = new Audio('assets/bg-music.wav');
  assets.music.loop = true;
  assets.bump = new Audio('assets/bump.wav');
  assets.power = new Audio('assets/power.wav');
}

function reset(){
  obstacles = []; powerups = []; score = 0; lives = 3; speed = 2; boost=false;
  scoreEl.textContent = score; livesEl.textContent = lives;
}

function start(){
  if(!running){
    running = true;
    lastTime = performance.now();
    assets.music.play().catch(()=>{});
    requestAnimationFrame(loop);
  }
}

function stop(){
  running = false;
  assets.music.pause();
}

startBtn.addEventListener('click', ()=>{
  reset(); start();
});

muteBtn.addEventListener('click', ()=>{
  mute = !mute;
  assets.music.muted = mute;
  assets.bump.muted = mute;
  assets.power.muted = mute;
  muteBtn.textContent = mute? 'Unmute':'Mute';
});

leftBtn.addEventListener('click', ()=>{ player.lane = Math.max(0, player.lane-1); });
rightBtn.addEventListener('click', ()=>{ player.lane = Math.min(2, player.lane+1); });
boostBtn.addEventListener('click', ()=>{ boost = true; setTimeout(()=>boost=false, 1200); });

document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowLeft') player.lane = Math.max(0, player.lane-1);
  if(e.key === 'ArrowRight') player.lane = Math.min(2, player.lane+1);
  if(e.key === ' ') { boost = true; setTimeout(()=>boost=false, 1200); }
});

function spawnObstacle(){
  let lane = Math.floor(Math.random()*3);
  obstacles.push({
    x: lanes[lane],
    y: -60,
    w: 70,
    h: 70,
    speed: speed + Math.random()*1.5 + 0.5
  });
}

function spawnPowerup(){
  let lane = Math.floor(Math.random()*3);
  powerups.push({
    x: lanes[lane],
    y: -60,
    w: 48,
    h: 48,
    kind: Math.random() > 0.6 ? 'life' : 'score',
    speed: speed
  });
}

function loop(ts){
  let dt = (ts - lastTime)/16.666; // ~60fps scale
  lastTime = ts;
  update(dt);
  draw();
  if(running) requestAnimationFrame(loop);
}

function update(dt){
  spawnTimer += dt;
  if(spawnTimer > 40){ // spawn obstacle frequently
    spawnTimer = 0;
    if(Math.random() < 0.75) spawnObstacle();
    if(Math.random() < 0.25) spawnPowerup();
  }
  // update obstacles
  obstacles.forEach(o => {
    o.y += o.speed * (boost ? 3 : 1) * (1 + speed*0.05);
  });
  obstacles = obstacles.filter(o => o.y < H + 100);

  powerups.forEach(p => p.y += p.speed * (boost ? 3 : 1));
  powerups = powerups.filter(p => p.y < H + 100);

  // collision
  const px = lanes[player.lane];
  obstacles.forEach((o,i) => {
    if(Math.abs(o.x - px) < 30 && Math.abs(o.y - player.y) < 40){
      // hit
      obstacles.splice(i,1);
      lives -= 1;
      livesEl.textContent = lives;
      if(!mute) assets.bump.play().catch(()=>{});
      if(lives <= 0){ running = false; assets.music.pause(); alert('Game Over! Score: '+score); }
    }
  });

  powerups.forEach((p,i) => {
    if(Math.abs(p.x - px) < 30 && Math.abs(p.y - player.y) < 40){
      powerups.splice(i,1);
      if(p.kind === 'life'){ lives = Math.min(5, lives+1); livesEl.textContent = lives; }
      else { score += 50; scoreEl.textContent = score; }
      if(!mute) assets.power.play().catch(()=>{});
    }
  });

  // scoring & speed increase
  score += 1 * (boost?3:1);
  scoreEl.textContent = Math.floor(score/1);
  if(score % 500 === 0) speed += 0.3;
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // road
  ctx.fillStyle = '#2c3e50';
  ctx.fillRect(40,0,W-80,H);
  // lanes lines
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 4;
  ctx.setLineDash([20,20]);
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
  ctx.setLineDash([]);

  // draw obstacles
  obstacles.forEach(o => {
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(o.x - o.w/2, o.y - o.h/2, o.w, o.h);
    ctx.fillStyle = '#000';
    ctx.fillText('X', o.x-6, o.y+6);
  });

  powerups.forEach(p => {
    ctx.fillStyle = p.kind === 'life' ? '#FFD700' : '#00FF00';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.w/2, 0, Math.PI*2); ctx.fill();
  });

  // draw player (image)
  const px = lanes[player.lane];
  if(assets.player){
    ctx.drawImage(assets.player, px - player.width/2, player.y - player.height/2, player.width, player.height);
  } else {
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(px-player.width/2, player.y-player.height/2, player.width, player.height);
  }
}
loadAssets(()=>{ console.log('assets loaded'); });
