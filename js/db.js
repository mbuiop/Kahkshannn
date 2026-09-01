/* =========================================================
   Jalali <-> Gregorian conversion (pure JS, no dependencies)
   ========================================================= */
function div(a,b){ return ~~(a/b); }
function jalCal(jy){
  var breaks=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
  var bl=breaks.length, gy=jy+621, leapJ=-14, jp=breaks[0], jm, jump, leap, n, i;
  if(jy<jp || jy>=breaks[bl-1]) throw new Error('Invalid Jalali year '+jy);
  for(i=1;i<bl;i+=1){ jm=breaks[i]; jump=jm-jp; if(jy<jm) break; leapJ+=div(jump,33)*8+div(jump%33,4); jp=jm; }
  n=jy-jp; leapJ+=div(n,33)*8+div((n%33)+3,4);
  if((jump%33)===4 && jump-n===4) leapJ+=1;
  var leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150;
  var march=20+leapJ-leapG;
  if(jump-n<6) n=n-jump+div(jump+4,33)*33;
  leap=((n+1)%33-1)%4; if(leap===-1) leap=4;
  return { leap:leap, gy:gy, march:march };
}
function g2d(gy,gm,gd){
  var d=div((gy+div(gm-8,6)+100100)*1461,4)+div(153*((gm+9)%12)+2,5)+gd-34840408;
  d=d-div(div(gy+100100+div(gm-8,6),100)*3,4)+752;
  return d;
}
function d2g(jdn){
  var j=4*jdn+139361631;
  j=j+div(div(4*jdn+183187720,146097)*3,4)*4-3908;
  var i=div((j%1461),4)*5+308;
  var gd=div(i%153,5)+1;
  var gm=(div(i,153)%12)+1;
  var gy=div(j,1461)-100100+div(8-gm,6);
  return [gy,gm,gd];
}
function j2d(jy,jm,jd){ var r=jalCal(jy); return g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1; }
function d2j(jdn){
  var gy=d2g(jdn)[0], jy=gy-621, r, jdn1f, k, jm, jd;
  r=jalCal(jy); jdn1f=g2d(gy,3,r.march); k=jdn-jdn1f;
  if(k>=0){ if(k<=185){ jm=1+div(k,31); jd=(k%31)+1; return [jy,jm,jd]; } else k-=186; }
  else { jy-=1; k+=179; if(r.leap===1) k+=1; }
  jm=7+div(k,30); jd=(k%30)+1;
  return [jy,jm,jd];
}
function gregorianToJalali(gy,gm,gd){ return d2j(g2d(gy,gm,gd)); }
function jalaliToGregorian(jy,jm,jd){ return d2g(j2d(jy,jm,jd)); }

var jMonths=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
var faDigits=['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
function toFa(n){ return String(n).replace(/[0-9]/g,function(d){ return faDigits[d]; }); }
function jalaliStr(jy,jm,jd){ return toFa(jd)+' '+jMonths[jm-1]+' '+toFa(jy); }
function jalaliStrShort(jy,jm){ return jMonths[jm-1]+' '+toFa(jy); }
function jalaliKey(jy,jm){ return jy+'-'+String(jm).padStart(2,'0'); }
function todayJalali(){ var t=new Date(); return gregorianToJalali(t.getFullYear(),t.getMonth()+1,t.getDate()); }
function todayJDN(){ var t=new Date(); return g2d(t.getFullYear(),t.getMonth()+1,t.getDate()); }
function gDateToJDN(gDateStr){ var p=gDateStr.split('-').map(Number); return g2d(p[0],p[1],p[2]); }
function gDateToJalali(gDateStr){ var p=gDateStr.split('-').map(Number); return gregorianToJalali(p[0],p[1],p[2]); }
function daysBetween(jdnA,jdnB){ return jdnB-jdnA; }

function fmtMoney(n, unit){
  unit = unit || 'تومان';
  var neg = n<0; n=Math.abs(Math.round(n));
  var s=n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return (neg?'−':'')+toFa(s)+' '+unit;
}
function fmtNumber(n){
  var s=Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
  return toFa(s);
}
function uid(){ return Date.now().toString(36)+Math.floor(Math.random()*100000).toString(36); }

/* =========================================================
   Data layer (localStorage)
   ========================================================= */
var DB_KEYS = {
  transactions: 'acc_transactions_v1',
  cheques: 'acc_cheques_v1',
  contacts: 'acc_contacts_v1',
  rates: 'acc_currency_rates_v1',
  budgets: 'acc_budgets_v1',
  categories: 'acc_categories_v1'
};
var DEFAULT_CATEGORIES = {
  expense: ['خوراک و بازار','حمل‌ونقل','مسکن و قبوض','خرید و پوشاک','سلامت','آموزش','تفریح','حقوق پرسنل','سایر هزینه'],
  income: ['حقوق و دستمزد','فروش کالا/خدمات','سرمایه‌گذاری','هدیه و سایر','سایر درآمد']
};
function loadJSON(key, fallback){
  try{ var v=JSON.parse(localStorage.getItem(key)); return (v===null||v===undefined)?fallback:v; }
  catch(e){ return fallback; }
}
function saveJSON(key,val){ localStorage.setItem(key, JSON.stringify(val)); }

var DB = {
  getTransactions:function(){ return loadJSON(DB_KEYS.transactions, []); },
  saveTransactions:function(list){ saveJSON(DB_KEYS.transactions, list); },
  getCheques:function(){ return loadJSON(DB_KEYS.cheques, []); },
  saveCheques:function(list){ saveJSON(DB_KEYS.cheques, list); },
  getContacts:function(){ return loadJSON(DB_KEYS.contacts, []); },
  saveContacts:function(list){ saveJSON(DB_KEYS.contacts, list); },
  getRates:function(){ return loadJSON(DB_KEYS.rates, []); },
  saveRates:function(list){ saveJSON(DB_KEYS.rates, list); },
  getBudgets:function(){ return loadJSON(DB_KEYS.budgets, {}); },
  saveBudgets:function(obj){ saveJSON(DB_KEYS.budgets, obj); },
  getCategories:function(){ return loadJSON(DB_KEYS.categories, DEFAULT_CATEGORIES); },
  saveCategories:function(obj){ saveJSON(DB_KEYS.categories, obj); },
  contactName:function(id){
    if(!id) return '—';
    var c=DB.getContacts().find(function(x){ return x.id===id; });
    return c? c.name : '—';
  },
  exportAll:function(){
    return {
      version:1,
      exportedAt: new Date().toISOString(),
      transactions: DB.getTransactions(),
      cheques: DB.getCheques(),
      contacts: DB.getContacts(),
      rates: DB.getRates(),
      budgets: DB.getBudgets(),
      categories: DB.getCategories()
    };
  },
  importAll:function(data){
    if(!data) return false;
    if(Array.isArray(data.transactions)) DB.saveTransactions(data.transactions);
    if(Array.isArray(data.cheques)) DB.saveCheques(data.cheques);
    if(Array.isArray(data.contacts)) DB.saveContacts(data.contacts);
    if(Array.isArray(data.rates)) DB.saveRates(data.rates);
    if(data.budgets && typeof data.budgets==='object') DB.saveBudgets(data.budgets);
    if(data.categories && typeof data.categories==='object') DB.saveCategories(data.categories);
    return true;
  },
  resetAll:function(){
    Object.keys(DB_KEYS).forEach(function(k){ localStorage.removeItem(DB_KEYS[k]); });
  },
  /* cheques due within N days and not yet cleared/cancelled */
  upcomingCheques:function(days){
    days = days===undefined?7:days;
    var t = todayJDN();
    return DB.getCheques().filter(function(c){
      if(c.status==='cleared' || c.status==='cancelled') return false;
      var d = gDateToJDN(c.dueDate);
      var diff = d - t;
      return diff <= days;
    }).sort(function(a,b){ return gDateToJDN(a.dueDate)-gDateToJDN(b.dueDate); });
  }
};
