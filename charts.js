var PALETTE = ['#CBA135','#4FA37E','#C24A5D','#5B8FB0','#B07EC2','#D9944A','#6FB6A8','#9AA34C','#C2718A','#8AA1C2'];

function clearCanvas(ctx,w,h){ ctx.clearRect(0,0,w,h); }

/* ---------- Pie chart ---------- */
function drawPie(canvas, data){
  /* data: [{label, value}] */
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  clearCanvas(ctx,w,h);
  var total = data.reduce(function(s,d){ return s+d.value; },0);
  if(total<=0) return;
  var cx=w/2, cy=h/2, r=Math.min(w,h)/2-4, start=-Math.PI/2;
  data.forEach(function(d,i){
    var slice=(d.value/total)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,start,start+slice); ctx.closePath();
    ctx.fillStyle = d.color || PALETTE[i%PALETTE.length];
    ctx.fill();
    start += slice;
  });
  ctx.beginPath(); ctx.arc(cx,cy,r*0.55,0,Math.PI*2);
  ctx.fillStyle = '#143A44'; ctx.fill();
}

/* ---------- Grouped bar chart ---------- */
function drawGroupedBar(canvas, labels, series){
  /* series: [{name, color, values:[...]}] values aligned with labels */
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  clearCanvas(ctx,w,h);
  var padL=46, padB=26, padT=14, padR=10;
  var plotW = w-padL-padR, plotH = h-padT-padB;
  var maxVal = 0;
  series.forEach(function(s){ s.values.forEach(function(v){ if(v>maxVal) maxVal=v; }); });
  if(maxVal<=0) maxVal = 1;
  var niceMax = niceCeil(maxVal);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.fillStyle = '#9FC0BC';
  ctx.font = '11px Tahoma, sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
  var gridLines = 4;
  for(var g=0; g<=gridLines; g++){
    var y = padT + plotH - (plotH*g/gridLines);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    var val = niceMax*g/gridLines;
    ctx.fillText(shortNum(val), padL-6, y);
  }

  var n = labels.length, groupW = plotW/n;
  var barGap = 4, seriesN = series.length;
  var barW = Math.max(4,(groupW-barGap*(seriesN+1))/seriesN);

  labels.forEach(function(lab,i){
    var gx = padL + i*groupW;
    series.forEach(function(s,si){
      var v = s.values[i]||0;
      var bh = (v/niceMax)*plotH;
      var bx = gx + barGap + si*(barW+barGap);
      var by = padT+plotH-bh;
      ctx.fillStyle = s.color;
      ctx.fillRect(bx,by,barW,bh);
    });
    ctx.fillStyle = '#9FC0BC'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.font = '11px Tahoma, sans-serif';
    ctx.fillText(lab, gx+groupW/2, padT+plotH+6);
  });
}

/* ---------- Line chart ---------- */
function drawLine(canvas, labels, values, color){
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  clearCanvas(ctx,w,h);
  if(values.length===0) return;
  var padL=54, padB=26, padT=14, padR=14;
  var plotW=w-padL-padR, plotH=h-padT-padB;
  var minV = Math.min.apply(null, values.concat([0]));
  var maxV = Math.max.apply(null, values);
  if(maxV===minV){ maxV = minV+1; }
  var niceMax = niceCeil(maxV);
  var niceMin = minV<0 ? -niceCeil(-minV) : 0;
  var range = niceMax-niceMin || 1;

  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.fillStyle='#9FC0BC';
  ctx.font='11px Tahoma, sans-serif'; ctx.textAlign='right'; ctx.textBaseline='middle';
  var gridLines=4;
  for(var g=0; g<=gridLines; g++){
    var val = niceMin + range*g/gridLines;
    var y = padT+plotH-(plotH*g/gridLines);
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillText(shortNum(val), padL-6, y);
  }

  var stepX = values.length>1 ? plotW/(values.length-1) : 0;
  function xFor(i){ return padL + stepX*i; }
  function yFor(v){ return padT + plotH - ((v-niceMin)/range)*plotH; }

  /* filled area */
  ctx.beginPath();
  ctx.moveTo(xFor(0), yFor(niceMin));
  values.forEach(function(v,i){ ctx.lineTo(xFor(i), yFor(v)); });
  ctx.lineTo(xFor(values.length-1), yFor(niceMin));
  ctx.closePath();
  ctx.fillStyle = color+'22';
  ctx.fill();

  /* line */
  ctx.beginPath();
  values.forEach(function(v,i){ var x=xFor(i), y=yFor(v); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth=1;

  /* points */
  values.forEach(function(v,i){
    ctx.beginPath(); ctx.arc(xFor(i), yFor(v), 3, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
  });

  /* x labels (skip some if crowded) */
  ctx.fillStyle='#9FC0BC'; ctx.textAlign='center'; ctx.textBaseline='top';
  var skip = labels.length>10 ? Math.ceil(labels.length/10) : 1;
  labels.forEach(function(lab,i){
    if(i % skip !== 0 && i!==labels.length-1) return;
    ctx.fillText(lab, xFor(i), padT+plotH+6);
  });
}

function niceCeil(v){
  if(v<=0) return 1;
  var mag = Math.pow(10, Math.floor(Math.log10(v)));
  var res = Math.ceil(v/mag)*mag;
  return res;
}
function shortNum(v){
  var abs = Math.abs(v);
  if(abs>=1000000) return toFa((v/1000000).toFixed(1))+'م';
  if(abs>=1000) return toFa((v/1000).toFixed(0))+'ه';
  return toFa(Math.round(v));
}
