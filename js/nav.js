var NAV_ITEMS = [
  { key:'dashboard', label:'داشبورد', href:'index.html' },
  { key:'transactions', label:'تراکنش‌ها', href:'transactions.html' },
  { key:'cheques', label:'مدیریت چک‌ها', href:'cheques.html' },
  { key:'currency', label:'نرخ ارز', href:'currency.html' },
  { key:'budgets', label:'بودجه‌بندی', href:'budgets.html' },
  { key:'reports', label:'گزارش‌ها', href:'reports.html' },
  { key:'contacts', label:'طرف‌حساب‌ها', href:'contacts.html' },
  { key:'settings', label:'تنظیمات', href:'settings.html' }
];

function renderNav(){
  var page = document.body.getAttribute('data-page') || '';
  var title = document.body.getAttribute('data-title') || '';
  var sub = document.body.getAttribute('data-sub') || '';

  var dueCount = DB.upcomingCheques(7).length;

  var navHtml = '<div class="brand">دفتر حساب<small>سامانه مالی و چک</small></div><nav>';
  NAV_ITEMS.forEach(function(item){
    var active = item.key === page ? ' active' : '';
    var badge = (item.key==='cheques' && dueCount>0) ? '<span class="badge-count">'+toFa(dueCount)+'</span>' : '';
    navHtml += '<a href="'+item.href+'" class="'+active.trim()+'">'+item.label+badge+'</a>';
  });
  navHtml += '</nav>';
  var t = todayJalali();
  navHtml += '<div class="foot">امروز<br>'+jalaliStr(t[0],t[1],t[2])+'</div>';

  var sidebar = document.getElementById('sidebarNav');
  if(sidebar) sidebar.innerHTML = navHtml;

  var topbar = document.getElementById('topbar');
  if(topbar){
    topbar.innerHTML =
      '<div><h1>'+title+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+
      '<div class="actions" id="topbarActions"></div>';
  }
}
document.addEventListener('DOMContentLoaded', renderNav);
