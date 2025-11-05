const TILE=32,ROWS=19,COLS=19;
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score');
const modal=document.getElementById('modal');
const yesBtn=document.getElementById('yesBtn');
const noBtn=document.getElementById('noBtn');
let score=0,gameOver=false;

const rawMap=["1111111111111111111","1000000001000000001","1011111101011111101","1020000000000000201","1010111111111110101","1000100001000010001","1110101111010110111","0000101000010100000","1110101011110101111","1000001000001000001","1011101110111011101","1020000000000000201","1010111111111110101","1000100001000010001","1011111101011111101","1000000001000000001","1111111111111111111","1111111111111111111","1111111111111111111"];
let map=[];
function createMap(){
  map=[];
  for(let r=0;r<ROWS;r++){
    map[r]=[];
    for(let c=0;c<COLS;c++){
      const ch=rawMap[r]?rawMap[r][c]:'1';
      map[r][c]=(ch==='1')?1:(ch==='2'?2:0);
    }
  }
}
createMap();
const pac={r:15,c:9,dir:{r:0,c:0},nextDir:{r:0,c:0},radius:12,moveTimer:0};
const ghosts=[{r:3,c:9,dir:{r:0,c:1},moveTimer:0},{r:5,c:9,dir:{r:0,c:-1},moveTimer:0}];

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const x=c*TILE,y=r*TILE;
      if(map[r][c]===1){
        ctx.fillStyle='#10243a';
        roundRect(ctx,x+2,y+2,TILE-4,TILE-4,6,true,false);
      } else {
        ctx.fillStyle='#061024';
        ctx.fillRect(x,y,TILE,TILE);
        if(map[r][c]===2){
          ctx.beginPath();
          ctx.fillStyle='#ffd966';
          ctx.arc(x+TILE/2,y+TILE/2,4,0,Math.PI*2);
          ctx.fill();
        }
      }
    }
  }
  const px=pac.c*TILE+TILE/2,py=pac.r*TILE+TILE/2;
  ctx.beginPath();ctx.fillStyle='#ffd11a';ctx.arc(px,py,pac.radius,0,Math.PI*2);ctx.fill();
  ghosts.forEach(g=>{
    const gx=g.c*TILE+TILE/2,gy=g.r*TILE+TILE/2;
    ctx.beginPath();ctx.fillStyle='#ff5c5c';
    ctx.arc(gx,gy,12,Math.PI,0);
    ctx.fillRect(gx-12,gy,24,12);
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(gx-5,gy-2,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(gx+5,gy-2,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#000';
    ctx.beginPath();ctx.arc(gx-5,gy-2,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(gx+5,gy-2,1.2,0,Math.PI*2);ctx.fill();
  });
}
function roundRect(ctx,x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();if(fill)ctx.fill();if(stroke)ctx.stroke();}
function canMove(r,c){if(r<0||c<0||r>=ROWS||c>=COLS)return false;return map[r][c]!==1;}
function update(dt){
  if(gameOver)return;
  pac.moveTimer+=dt;ghosts.forEach(g=>g.moveTimer+=dt);
  if(pac.moveTimer>220){
    pac.moveTimer=0;
    const nd=pac.nextDir;if(nd.r||nd.c){const tryR=pac.r+nd.r,tryC=pac.c+nd.c;if(canMove(tryR,tryC))pac.dir={...nd};}
    const nr=pac.r+pac.dir.r,nc=pac.c+pac.dir.c;
    if(canMove(nr,nc)){pac.r=nr;pac.c=nc;}
    if(map[pac.r][pac.c]===2){map[pac.r][pac.c]=0;score+=10;scoreEl.textContent='Score: '+score;checkWin();}
  }
  ghosts.forEach(g=>{
    if(g.moveTimer>150){
      g.moveTimer=0;
      if(Math.random()<0.2){
        const dr=Math.sign(pac.r-g.r),dc=Math.sign(pac.c-g.c);
        const choices=[];
        if(dr&&canMove(g.r+dr,g.c))choices.push({r:dr,c:0});
        if(dc&&canMove(g.r,g.c+dc))choices.push({r:0,c:dc});
        if(choices.length)g.dir=choices[Math.floor(Math.random()*choices.length)];
      }
      if(Math.random()<0.08){
        const dirs=[{r:1,c:0},{r:-1,c:0},{r:0,c:1},{r:0,c:-1}];
        const cand=dirs.filter(d=>canMove(g.r+d.r,g.c+d.c));
        if(cand.length)g.dir=cand[Math.floor(Math.random()*cand.length)];
      }
      const gr=g.r+g.dir.r,gc=g.c+g.dir.c;if(canMove(gr,gc)){g.r=gr;g.c=gc;}
    }
  });
  ghosts.forEach(g=>{if(g.r===pac.r&&g.c===pac.c)endGame();});
}
function checkWin(){for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(map[r][c]===2)return;gameOver=true;setTimeout(()=>{alert('Selamat! Kamu menang! Score: '+score);resetGame();},100);}
function endGame(){gameOver=true;setTimeout(()=>{showQuestion();},120);}
function showQuestion(){modal.classList.add('show');}
function hideQuestion(){modal.classList.remove('show');}

window.addEventListener('keydown',e=>{
  const k=e.key;
  if(k==='ArrowUp'||k==='w'||k==='W')pac.nextDir={r:-1,c:0};
  if(k==='ArrowDown'||k==='s'||k==='S')pac.nextDir={r:1,c:0};
  if(k==='ArrowLeft'||k==='a'||k==='A')pac.nextDir={r:0,c:-1};
  if(k==='ArrowRight'||k==='d'||k==='D')pac.nextDir={r:0,c:1};
});

const transitionEl = document.querySelector('.page-transition');
yesBtn.addEventListener('click',()=>{
  hideQuestion();
  transitionEl.classList.add('active');
      setTimeout(() => {
        window.location.href = "halaman2.html";
      }, 1000);
});
noBtn.addEventListener('click',()=>{
  hideQuestion();
  alert('Oh, baiklah. Coba lagi ya!');
  resetGame();
});

function resetGame(){
  createMap();
  pac.r=15;pac.c=9;
  pac.dir={r:0,c:0};pac.nextDir={r:0,c:0};
  ghosts[0].r=3;ghosts[0].c=9;
  ghosts[1].r=5;ghosts[1].c=9;
  score=0;scoreEl.textContent='Score: 0';
  gameOver=false;hideQuestion();
}

let last=performance.now();
function loop(now){const dt=now-last;last=now;update(dt);draw();requestAnimationFrame(loop);}
resetGame();requestAnimationFrame(loop);