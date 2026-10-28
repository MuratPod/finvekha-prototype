/* Финвеха — ядро прототипа: формат чисел, иконки, допущения, каркас, роутер, состояния.
   Навигация по hash: #/route[/param]?state=...&theme=...&role=...  Работает через file:// */
(function(){
'use strict';
const D = window.DEMO, CFG = window.PROTO_CONFIG, NAME = window.PRODUCT_NAME;
const NB='\u00A0', MINUS='\u2212';
const $ = (s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc = s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Формат ru-RU: «−» U+2212, неразрывный пробел */
function num(x,dec=2){ return new Intl.NumberFormat('ru-RU',{minimumFractionDigits:dec,maximumFractionDigits:dec}).format(Math.abs(x)).replace(/\s/g,NB); }
function money(x,{dec=2,sign=false,cur='₽',approx=false}={}){
  if(x===null||x===undefined) return '—';
  const s = x<0?MINUS:(sign&&x>0?'+':'');
  return (approx?'≈'+NB:'')+s+num(x,dec)+NB+cur;
}
const rub=(x,o={})=>money(x,Object.assign({dec:0},o));
function pct(x,{dec=1,sign=false}={}){ const s=x<0?MINUS:(sign&&x>0?'+':''); return s+num(x,dec)+NB+'%'; }
function delta(x,txt){ // ± не только цветом: знак + стрелка + aria
  if(!x) return `<span class="neutral" aria-label="без изменений">0 ₽ —</span>`;
  const up=x>0; return `<span class="${up?'up':'down'}" aria-label="${up?'рост':'падение'}">${up?'▲':'▼'} ${txt}</span>`;
}

/* ---------- Иконки (inline SVG) */
const IC={
 home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 wallet:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
 chart:'<path d="M4 19V5M4 19h16M8 15l4-4 3 3 5-6"/>',
 target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
 doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.6c2 .8 3.2 2.6 3.6 5.4"/>',
 check:'<path d="M4 12.5 9 17.5 20 6.5"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
 msg:'<path d="M4 5h16v11H9l-5 4z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
 upload:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 x:'<path d="M6 6l12 12M18 6 6 18"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01M3 3l18 18"/>',
 alert:'<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 bank:'<path d="M3 10 12 4l9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18"/>',
 debt:'<path d="M4 7h16v10H4z"/><path d="M8 12h8M12 9v6"/>',
 pen:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'
};
const ic=(n,c='i')=>`<svg class="${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const LOGO_MARK=`<svg width="28" height="28" viewBox="0 0 36 36" aria-hidden="true"><rect x="1" y="1" width="34" height="34" rx="7" fill="#2563EB"/><path d="M13 8v19" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/><path d="M14.3 8.6 25 12.6l-10.7 4z" fill="#fff"/><path d="M8.5 27h14" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".75"/></svg>`;

/* ---------- Метки */
const DEMO_B=`<span class="bdg bdg-demo" title="Демонстрационные данные: цифры вымышлены">Пример</span>`;
const MANUAL_B=`<span class="bdg bdg-manual" title="Значение введено вручную, не из интеграции">${ic('pen','i-s')} Вручную</span>`;
const FC_B=(t='Прогноз')=>`<span class="bdg bdg-fc">${t}</span>`;
const EST_B=`<span class="bdg bdg-est" title="Расчётная величина">Оценка</span>`;
/* Допущения: решения, не утверждённые Муратом — design/assumptions.md */
const ASSUME={
 'A-01':{q:'Q5',t:'Пороги устаревания',x:'Котировки Мосбиржи: > 30 мин в часы торгов, вне торгов — не за последнюю торговую сессию. Курс ЦБ РФ — не на текущую дату. Отчёт брокера и выписка банка — 7 дн. и старше. Ручные данные и обязательства — старше 31 дн.'},
 'A-02':{q:'Q6',t:'«Только чтение»',x:'Трактуем как «без торговли и переводов денег»: ручной ввод счетов, операций, целей и обязательств разрешён.'},
 'A-03':{q:'Q7',t:'Отчёты для клиента',x:'Клиент видит тот же отчёт по себе и может экспортировать его; внутренние заметки консультанта в отчёт не попадают.'},
 'A-04':{q:'Q8',t:'Где клиент видит рекомендации',x:'Опубликованные рекомендации консультанта — блок на главной клиента и раздел в «Отчётах». Записи на консультацию, чата и оплаты в MVP нет.'},
 'A-05':{q:'Q9',t:'Роли администратор/помощник',x:'Не показаны. Помощник — предположительно просмотр списка клиентов без заметок; матрица доступа нужна до макетов H7/H8.'},
 'A-06':{q:'Q10',t:'Журнал доступа для клиента',x:'Клиент видит журнал: кто, когда получил/отозвал доступ и открывал его данные.'},
 'A-07':{q:'Q11',t:'Копейки',x:'В KPI и карточках — рубли без копеек (точное значение — в подсказке), в таблицах и формах — 2 знака.'},
 'A-08':{q:'Q15 (налоги)',t:'Налоговая оценка',x:'Показываем удержанный брокером налог как факт; оценка НДФЛ к уплате — только строкой «≈ … (оценка)», в итог не входит.'},
 'A-09':{q:'Q16',t:'Доходность к погашению, дюрация, рейтинг',x:'Купонная доходность и YTM показываются с меткой «Оценка» (расчёт по цене Мосбиржи без налогов и реинвестиций); дюрация и рейтинг скрыты до подтверждения источника — «нет данных».'},
 'A-10':{q:'Q19',t:'Пресеты периода',x:'Месяц · 3 мес · Год · С начала года · Всё · Свой.'},
 'A-11':{q:'Q13 (форматы)',t:'Где взять отчёт брокера и формат',x:'Обобщённо: «в личном кабинете брокера, раздел отчётов». Ожидаемые форматы указаны предположительно — уточним по реальным отчётам. Точные пункты меню брокеров не указываем.'},
 'A-12':{q:'Q15 (база)',t:'Индекс для сравнения',x:'Ценовой индекс Мосбиржи (IMOEX) за тот же период; не индекс полной доходности. Нужна методика (§8.7).'},
 'A-13':{q:'§8.8',t:'Правило оценки облигаций',x:'Цена Мосбиржи — «без НКД» (чистая); стоимость = цена % × номинал × кол-во + НКД × кол-во. Если источник даёт цену с НКД — НКД не добавляем.'},
 'A-15':{q:'§4.6',t:'Срок согласия клиента',x:'Доступ консультанта выдаётся на 6 месяцев с продлением; в ТЗ срок не задан.'},
 'A-16':{q:'Q15 (период)',t:'Период XIRR',x:'По умолчанию последние 12 месяцев; при меньшей истории — «с начала учёта» с пометкой.'}
};
function assume(id,{right=false,short=false}={}){
  const a=ASSUME[id]; if(!a) return '';
  return `<span class="assume-wrap"><span class="bdg bdg-assume" tabindex="0" aria-describedby="tip-${id}-${++assume.n}">◇ Допущение${short?'':''}</span><span class="tip${right?' r':''}" role="tooltip" id="tip-${id}-${assume.n}"><b>${a.t}</b><br>${a.x}<br><span class="q">${id} · ${a.q} — ждёт подтверждения, design/assumptions.md</span></span></span>`;
}
assume.n=0;

/* ---------- Состояние приложения */
const STATES=[['normal','Обычное'],['loading','Загрузка'],['empty','Нет данных'],['stale','Устаревшие'],['partial','Частичные'],['error','Ошибка интеграции (БКС)'],['offline','Офлайн'],['success','Успех'],['confirm','Подтверждение']];
const S={ route:'home', param:null, q:{}, state:'normal', theme:'light', role:'client', protoOpen:false, toasts:[], modal:null, panel:null,
  goals:D.goals.slice(), ops:D.ops.slice(), notes:D.notes.slice(), liabs:D.liabilities.slice(), importStep:{bank:0,broker:0}, broker:'bks', brokerFail:false, quickOpen:false };
window.S=S;

/* Источники со сдвигом по состоянию */
function src(k){
  const s=Object.assign({},D.sources[k]);
  if(S.state==='stale'){ if(k==='sber'){s.date='21.10.2026';s.time='08:40';s.stale='7 дн. назад';} if(k==='moex'){s.date='26.10.2026';s.time='18:45';s.stale='не за последнюю сессию';} }
  if(S.state==='error'&&k==='bks'){ s.err='не удалось импортировать отчёт 28.10.2026, 19:32 МСК'; }
  return s;
}
function stampText(k){ const s=src(k); const t=s.time?`${s.date}, ${s.time} ${s.name==='Мосбиржа'?'МСК':'МСК'}`:s.date;
  if(k==='cbr') return `ЦБ РФ · курс на ${s.date}`;
  if(k==='moex') return `Мосбиржа · ${t}`;
  if(k==='bks') return `Импорт отчёта БКС · ${s.date}`;
  if(k==='manual') return `Вручную · ${s.date}`;
  return `${s.name} · ${s.method} · ${t}`;
}
function stamp(text,{stale=false,err=false,tip=false}={}){
  return `<div class="stamp${stale?' stale':''}${err?' err':''}">${ic(stale?'clock':err?'x':'clock','i-s')}<span>${text}</span>${stale&&tip?assume('A-01'):''}</div>`;
}
function stampSrc(keys,extra=''){ // несколько источников в одной строке
  const parts=keys.map(k=>{const s=src(k); return s.stale?`<b>${stampText(k)} · устарело (${s.stale})</b>`:s.err?`<b>${s.name}: ${s.err}</b>`:stampText(k);});
  const st=keys.some(k=>src(k).stale), er=keys.some(k=>src(k).err);
  return stamp(parts.join(' · ')+extra,{stale:st,err:er&&!st,tip:st});
}

/* ---------- Расчёты (сходимость Q12) */
function calc(){
  const accs=D.accounts.filter(a=>!(S.state==='partial'&&a.id==='usd'));
  const cash=accs.reduce((s,a)=>s+a.bal,0);
  const bonds=D.bonds.map(b=>({...b, clean:+(b.qty*b.pricePct/100*b.nominal).toFixed(2), nkdSum:+(b.qty*b.nkd).toFixed(2)})).map(b=>({...b,val:+(b.clean+b.nkdSum).toFixed(2)}));
  const stocks=D.stocks.map(s=>({...s,val:+(s.qty*s.price).toFixed(2)}));
  const fund={...D.fund,val:+(D.fund.qty*D.fund.price).toFixed(2)};
  const bT=bonds.reduce((s,b)=>s+b.val,0), sT=stocks.reduce((s,b)=>s+b.val,0);
  const portfolio=+(bT+sT+fund.val+D.brokerCash).toFixed(2);
  const liab=S.liabs.reduce((s,l)=>s+l.bal,0);
  return {accs,cash,bonds,stocks,fund,bT,sT,portfolio,liab,net:+(cash+portfolio-liab).toFixed(2),assets:cash+portfolio,
    reserved:S.goals.reduce((s,g)=>s+g.saved,0)};
}
window.CALC=calc;

/* ---------- Навигация по роли (Q17) */
const NAV={
 client:[
  ['home','Главная','home'],
  ['accounts','Личные финансы','wallet',[['accounts','Счета'],['operations','Операции'],['budget','Бюджет'],['liabilities','Обязательства'],['import','Импорт выписки']]],
  ['portfolio','Инвестиции','chart',[['portfolio','Портфель'],['payouts','Календарь выплат'],['import/broker','Импорт отчёта']]],
  ['goals','Цели','target'],['report','Отчёты','doc'],['settings','Настройки','gear']],
 consultant:[
  ['clients','Клиенты','users'],['tasks','Задачи','list'],['recommendations','Рекомендации','msg'],['client-reports','Отчёты для клиентов','doc'],['settings','Настройки','gear']]
};
const ROUTE_ROLE={home:'client',accounts:'client',operations:'client',budget:'client',liabilities:'client',import:'client',portfolio:'client',bond:'client',payouts:'client',goals:'client',report:'client',quick:'client',
  clients:'consultant',tasks:'consultant',recommendations:'consultant','client-reports':'consultant'};
const SECTION_OF={operations:'accounts',budget:'accounts',liabilities:'accounts',import:'accounts',bond:'portfolio',payouts:'portfolio',quick:'home'};

function href(route,extra){ const q=new URLSearchParams(); if(S.state!=='normal')q.set('state',S.state); if(S.theme!=='light')q.set('theme',S.theme); if(S.role!=='client')q.set('role',S.role);
  if(extra) for(const k in extra) q.set(k,extra[k]); const qs=q.toString(); return '#/'+route+(qs?'?'+qs:''); }
window.href=href;

function sidebar(){
  const cur=S.route+(S.param?'/'+S.param:'');
  const sec=(S.route==='import'&&S.param==='broker')?'portfolio':(SECTION_OF[S.route]||S.route);
  let h=`<aside class="sb" id="sidebar" aria-label="Боковая панель"><a class="brand" href="${href(S.role==='client'?'home':'clients')}" aria-label="${NAME} — на главную">${LOGO_MARK}<span>${NAME}</span></a>`;
  h+=`<div class="role-tag">${S.role==='client'?'Личный кабинет · '+D.client.name:'Рабочее место консультанта'}</div><nav class="nav" aria-label="Основная навигация">`;
  for(const [r,t,i,sub] of NAV[S.role]){
    const on = sec===r;
    h+=`<a href="${href(r)}" class="${on?'on':''}" ${on?'aria-current="page"':''} title="${t}">${ic(i)}<span>${t}</span></a>`;
    if(sub&&on) for(const [sr,st] of sub){ const son=cur===sr||(sr==='portfolio'&&S.route==='bond')||(sr==='import'&&S.route==='import'&&!S.param); h+=`<a href="${href(sr)}" class="sub${son?' on':''}" ${son?'aria-current="page"':''}><span>${st}</span></a>`; }
  }
  h+=`</nav>`;
  if(S.role==='client'){
    const row=(k,lbl)=>{const s=src(k); const part=S.state==='partial'&&k==='tbank'; const cls=S.state==='offline'?'off':s.err?'err':(s.stale||part)?'stale':'ok'; const sym={ok:'✓',stale:'!',err:'✕',off:'–'}[cls];
      const txt=S.state==='offline'?'нет связи':part?'частично · нет валютного счёта':s.err?'ошибка импорта':s.stale?'устарело · '+s.date.slice(0,5):(s.time?s.date.slice(0,5)+', '+s.time:s.date.slice(0,5));
      return `<div class="src"><span class="st ${cls}" aria-hidden="true">${sym}</span><span>${lbl} · ${txt}<small>${s.method}</small></span></div>`;};
    h+=`<div class="sb-foot"><div class="ttl">Источники данных ${DEMO_B}</div>${row('tbank','Т-Банк')}${row('sber','Сбербанк')}${row('bks','БКС')}${row('moex','Мосбиржа')}${row('cbr','ЦБ РФ')}</div>`;
  } else {
    h+=`<div class="sb-foot"><div class="ttl">Консультант</div><div class="src"><span>Анна Соколова<small>финансовый консультант</small></span></div></div>`;
  }
  return h+`</aside><div class="scrim" data-act="drawer-close"></div>`;
}

/* ---------- Глобальные баннеры по состоянию */
function stateBanner(){
  const st=S.state;
  if(st==='offline') return `<div class="banner off s12" role="status">${ic('wifi')}<div class="grow"><b>Нет подключения к сети.</b> Данные недоступны: ${NAME} не хранит финансовые данные на устройстве (§5.5). Откроем, как только связь восстановится.</div><button class="btn sm" data-act="retry">Проверить снова</button></div>`;
  if(st==='error') return `<div class="banner err s12" role="alert">${ic('x')}<div class="grow"><b>БКС: не удалось импортировать отчёт</b> 28.10.2026, 19:32 МСК — формат файла не распознан. Показаны данные из отчёта на 27.10.2026.</div><button class="btn sm" data-act="retry">Повторить</button><a class="btn sm" href="${href('import/broker')}">Импортировать отчёт</a></div>`;
  if(st==='stale') return `<div class="banner warn s12" role="status">${ic('clock')}<div class="grow"><b>Данные 2 источников устарели:</b> Сбербанк — выписка на 21.10.2026 (7 дн.), Мосбиржа — котировки на 26.10.2026, 18:45 МСК. ${assume('A-01')}</div><button class="btn sm" data-act="retry">Обновить</button></div>`;
  if(st==='partial') return `<div class="banner warn s12" role="status">${ic('alert')}<div class="grow"><b>Частичные данные:</b> валютный счёт Т-Банка не загружен (выписка не импортирована). Итоги посчитаны без него.</div><a class="btn sm" href="${href('import')}">Импортировать выписку</a></div>`;
  return '';
}
window.demoBanner=()=>demoBanner();
function demoBanner(){ return `<div class="banner demo s12">${DEMO_B}<span><b>Демонстрационные данные.</b> Все суммы, цены и количества вымышлены и служат примером оформления. Метка ${`<span class="bdg bdg-assume">◇ Допущение</span>`} — решение не утверждено (design/assumptions.md).</span></div>`; }

/* ---------- Компоненты для экранов */
function kcell(label,value,sub='',{href:h,na=false}={}){
  const tag=h?'a':'div'; return `<${tag} class="cell"${h?` href="${h}"`:''}><div class="lbl">${label}</div><div class="v num${na?' na':''}">${value}</div>${sub}</${tag}>`;
}
function skelStrip(n=5){ return `<div class="strip${n===4?' c4':''}" aria-busy="true">`+Array.from({length:n},(_,i)=>`<div class="cell"><div class="skel" style="height:12px;width:60%"></div><div class="skel" style="height:${i?24:34}px;width:80%;margin:8px 0 6px"></div><div class="skel" style="height:10px;width:70%"></div></div>`).join('')+`</div>`; }
function skelCards(){ const c=(s,h)=>`<div class="card ${s}"><div class="skel" style="height:12px;width:30%;margin-bottom:14px"></div><div class="skel" style="height:${h}px"></div></div>`;
  return `<div class="banner s12" role="status" aria-live="polite">${ic('refresh')}<span>Загружаем данные… Цифры не показываем, пока источники не ответят.</span></div>`+c('s8',220)+c('s4',220)+c('s8',180)+c('s4',180); }
function empty(title,text,actions=''){ return `<div class="empty">${`<div class="ico">${ic('info')}</div>`}<h3>${title}</h3><p>${text}</p><div class="row-l" style="justify-content:center">${actions}</div></div>`; }
function card(title,body,{cls='',acts='',demo=true}={}){ return `<section class="card ${cls}"><div class="card-h"><h2>${title}</h2><div class="acts">${acts}${demo?DEMO_B:''}</div></div>${body}</section>`; }

function chartNet(W=780,H=230){
  const h=D.history, n=h.months.length, pl=64,pr=16,pt=30,pb=28, lo=1.90,hi=2.65;
  const X=i=>pl+(W-pl-pr)*i/(n-1), Y=v=>pt+(H-pt-pb)*(1-(v-lo)/(hi-lo));
  const fp=h.fact.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area=`M${X(0)},${Y(lo)} L`+h.fact.map((v,i)=>`${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' L')+` L${X(11)},${Y(lo)} Z`;
  const fcp=h.fc.map((v,i)=>`${X(11+i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const tx=X(11);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Чистый капитал: факт за 12 месяцев (сплошная линия) и прогноз на 3 месяца (пунктир), пример"><defs><pattern id="hatchN" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="2" height="7" class="hatch-line"/></pattern><linearGradient id="gN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="area-stop1"/><stop offset="1" class="area-stop2"/></linearGradient></defs>`;
  for(const v of [2.0,2.2,2.4,2.6]){ const y=Y(v); s+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" class="grid"/><text x="${pl-10}" y="${y+4}" text-anchor="end" class="axis">${String(v.toFixed(1)).replace('.',',')} млн ₽</text>`; }
  s+=`<rect x="${tx}" y="${pt}" width="${W-pr-tx}" height="${H-pt-pb}" fill="url(#hatchN)"/><path d="${area}" fill="url(#gN)"/><polyline points="${fp}" class="line-fact"/><polyline points="${fcp}" class="line-fc"/>`;
  s+=`<line x1="${tx}" x2="${tx}" y1="${pt-8}" y2="${H-pb}" class="today"/><text x="${tx-6}" y="${pt-12}" text-anchor="end" class="lbl-fact">Факт · 28.10</text><text x="${tx+6}" y="${pt-12}" class="lbl-fc">Прогноз ›</text><circle cx="${tx}" cy="${Y(h.fact[11])}" r="4.5" class="dot"/>`;
  h.months.forEach((m,i)=>{ s+=`<text x="${X(i)}" y="${H-8}" text-anchor="middle" class="axis${i>11?' fc':''}">${m}</text>`; });
  return s+'</svg>';
}

/* ---------- Слои */
function toast(text,{undo=null,keep=false}={}){ const id=Date.now()+Math.random(); S.toasts.push({id,text,undo}); renderLayers(); if(!keep) setTimeout(()=>{S.toasts=S.toasts.filter(t=>t.id!==id);renderLayers();},4000); }
function openModal(m){ S.modal=m; renderLayers(); setTimeout(()=>{const f=$('.modal [data-autofocus]')||$('.modal button');f&&f.focus();},0); }
function closeModal(){ S.modal=null; renderLayers(); }
function openPanel(p){ S.panel=p; renderLayers(); }
function renderLayers(){
  let h='';
  if(S.panel) h+=`<aside class="panel" role="dialog" aria-modal="false" aria-label="${esc(S.panel.title)}"><div class="ph"><div><h2 style="font-size:16px">${S.panel.title}</h2>${S.panel.sub||''}</div><button class="btn ghost sm" data-act="panel-close" aria-label="Закрыть">${ic('x')}</button></div><div class="pb">${S.panel.body}</div></aside>`;
  if(S.modal) h+=`<div class="overlay" data-act="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mh"><div class="mh"><h2 id="mh">${S.modal.title}</h2><button class="btn ghost sm" data-act="modal-close" aria-label="Закрыть">${ic('x')}</button></div><div class="mb">${S.modal.body}</div><div class="mf">${S.modal.foot||`<button class="btn" data-act="modal-close">Отмена</button><button class="btn ${S.modal.danger?'danger':'primary'}" data-act="modal-ok" data-autofocus>${S.modal.ok||'Подтвердить'}</button>`}</div></div></div>`;
  h+=`<div class="toasts" aria-live="polite">${S.toasts.map(t=>`<div class="toast" role="status"><span class="ok">✓</span><span>${t.text}</span>${t.undo?`<button class="link" data-act="undo" data-id="${t.id}">Отменить</button>`:''}</div>`).join('')}</div>`;
  $('#layers').innerHTML=h;
}

/* ---------- Панель прототипа (служебная, не часть продукта) */
function protoPanel(){
  const st=STATES.find(s=>s[0]===S.state)[1];
  let h=`<div class="proto">`;
  if(S.protoOpen){
    h+=`<div class="pp" role="region" aria-label="Панель прототипа"><h4>Панель прототипа · только для прототипа, не часть продукта</h4>
    <div class="field"><label for="pp-state">Состояние экрана (§7.6)</label><select id="pp-state" class="inp">${STATES.map(([k,t])=>`<option value="${k}"${k===S.state?' selected':''}>${t}</option>`).join('')}</select></div>
    <div class="field"><span class="lab">Тема</span><div class="seg" role="radiogroup" aria-label="Тема">${[['light','Светлая'],['dark','Тёмная']].map(([k,t])=>`<button role="radio" aria-checked="${S.theme===k}" class="${S.theme===k?'on':''}" data-act="theme" data-v="${k}">${t}</button>`).join('')}</div></div>
    <div class="field"><span class="lab">Роль (демонстрация навигации по роли, Q17)</span><div class="seg" role="radiogroup" aria-label="Роль">${[['client','Клиент'],['consultant','Консультант']].map(([k,t])=>`<button role="radio" aria-checked="${S.role===k}" class="${S.role===k?'on':''}" data-act="role" data-v="${k}">${t}</button>`).join('')}</div><span class="hint">В продукте переключателя роли нет — роль задаётся при входе.</span></div>
    <div class="small t3">Название: <b>${NAME}</b> (config.js · PRODUCT_NAME) · ${CFG.version}</div></div>`;
  }
  h+=`<button data-act="proto" aria-expanded="${S.protoOpen}">⚙ Прототип<span class="lbl-long"> · ${st} · ${S.theme==='dark'?'Тёмная':'Светлая'} · ${S.role==='client'?'Клиент':'Консультант'}</span></button></div>`;
  return h;
}

/* ---------- Роутер */
function parseHash(){
  let h=location.hash.replace(/^#\/?/,''); const [path,qs]=h.split('?'); const q=new URLSearchParams(qs||'');
  const parts=(path||'').split('/').filter(Boolean);
  S.q=Object.fromEntries(q.entries());
  S.state=STATES.some(s=>s[0]===q.get('state'))?q.get('state'):'normal';
  S.theme=q.get('theme')==='dark'?'dark':'light';
  S.role=q.get('role')==='consultant'?'consultant':'client';
  S.route=parts[0]||(S.role==='client'?'home':'clients'); S.param=parts[1]||null;
  if(ROUTE_ROLE[S.route]&&ROUTE_ROLE[S.route]!==S.role){ location.replace(href(S.role==='client'?'home':'clients')); return false; }
  return true;
}
function render(){
  if(!parseHash()) return;
  document.documentElement.setAttribute('data-theme',S.theme);
  const scr=(window.SCREENS[S.route]||window.SCREENS.notfound)(S.param,{calc:calc()});
  document.title=`${scr.title} — ${NAME} (прототип)`;
  let band=scr.band||'';
  if(S.state==='loading'&&scr.band!==undefined) band=skelStrip(scr.kpiN||5);
  let body;
  if(S.state==='offline') body=stateBanner()+`<div class="card s12"><div class="offline-shell">${ic('wifi')}<h3 style="color:var(--color-text)">Нет подключения к сети</h3><p>Оболочка приложения доступна, финансовые данные — нет. Последние значения не показываем, чтобы не выдать устаревшее за актуальное.</p><button class="btn primary" data-act="retry">Проверить подключение</button></div></div>`;
  else if(S.state==='loading'&&!scr.noLoading) body=skelCards();
  else if(S.state==='empty'&&scr.empty) body=demoBanner()+`<div class="card s12">${scr.empty}</div>`;
  else body=(scr.noDemoBanner?'':demoBanner())+stateBanner()+scr.body;
  if(S.state==='offline') band=scr.band!==undefined?`<div class="strip${scr.kpiN===4?' c4':''}">`+Array.from({length:scr.kpiN||5},()=>`<div class="cell"><div class="lbl">—</div><div class="v na">нет связи</div></div>`).join('')+`</div>`:'';
  const top=`<header class="top"><div><button class="btn menu-btn sm" data-act="drawer" aria-label="Меню" aria-controls="sidebar">${ic('menu')}</button><div style="min-width:0">${scr.crumbs?`<div class="crumbs">${scr.crumbs}</div>`:''}<h1>${scr.title}</h1>${scr.stamp?`<div class="stamp">${scr.stamp}</div>`:''}</div></div><div class="top-r">${scr.actions||''}</div></header>`;
  $('#root').innerHTML=`<a class="skip" href="#content" data-act="skip">К содержимому</a><div class="app">${sidebar()}<main><div class="band">${top}${band}</div><div class="content ${scr.resp?'resp':''}" id="content" tabindex="-1">${body}</div></main></div>${protoPanel()}`;
  if(scr.after&&S.state!=='offline'&&S.state!=='loading') scr.after();
  // состояния «успех» и «подтверждение» — слои
  S.panel=S.panel&&S.panel.route===S.route?S.panel:null;
  if(S.state==='success'&&!S._succShown){ S._succShown=true; S.toasts=[{id:1,text:scr.successText||'Обновлено: 5 источников · 28.10.2026, 19:42 МСК'}]; }
  if(S.state!=='success'){ S._succShown=false; S.toasts=S.toasts.filter(t=>t.id!==1); }
  if(S.state==='confirm'&&scr.confirm&&!S.modal) S.modal=scr.confirm;
  if(S.state!=='confirm'&&S.modal&&S.modal._state) S.modal=null;
  renderLayers();
}
window.addEventListener('hashchange',()=>{S.panel=null; if(S.modal&&S.modal._state)S.modal=null; S._succShown=false; render(); window.scrollTo(0,0);});

/* ---------- События */
function go(h){ location.hash=h; }
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]'); if(!a) { const tr=e.target.closest('tr[data-href]'); if(tr&&!e.target.closest('a,button')) go(tr.dataset.href); return; }
  const act=a.dataset.act;
  const H=window.HANDLERS||{};
  if(act==='proto'){ S.protoOpen=!S.protoOpen; render(); return; }
  if(act==='theme'){ S.theme=a.dataset.v; go(href(S.route+(S.param?'/'+S.param:''))); return; }
  if(act==='role'){ S.role=a.dataset.v; go(href(S.role==='client'?'home':'clients')); return; }
  if(act==='modal-close'||(act==='modal-bg'&&e.target===a)){ const m=S.modal; S.modal=null; renderLayers(); if(m&&m._state) go(hrefState('normal')); return; }
  if(act==='modal-ok'){ const m=S.modal; S.modal=null; if(m&&m.onOk) m.onOk(); else renderLayers(); if(m&&m._state){ S.state='normal'; go(hrefState('normal')); } return; }
  if(act==='panel-close'){ S.panel=null; renderLayers(); $$('tr.sel').forEach(r=>r.classList.remove('sel')); return; }
  if(act==='undo'){ const t=S.toasts.find(x=>String(x.id)===a.dataset.id); if(t&&t.undo) t.undo(); S.toasts=S.toasts.filter(x=>x!==t); renderLayers(); return; }
  if(act==='retry'){ toast('Повторная проверка — заглушка прототипа'); return; }
  if(act==='drawer'){ document.body.classList.add('drawer-open'); return; }
  if(act==='drawer-close'){ document.body.classList.remove('drawer-open'); return; }
  if(act==='skip'){ e.preventDefault(); $('#content').focus(); return; }
  if(act==='stub'){ toast(a.dataset.msg||'Заглушка прототипа'); return; }
  if(H[act]) H[act](a,e);
});
document.addEventListener('change',e=>{ if(e.target.id==='pp-state'){ go(hrefState(e.target.value)); } const H=window.HANDLERS||{}; const a=e.target.closest('[data-change]'); if(a&&H[a.dataset.change]) H[a.dataset.change](a,e); });
document.addEventListener('input',e=>{ const H=window.HANDLERS||{}; const a=e.target.closest('[data-input]'); if(a&&H[a.dataset.input]) H[a.dataset.input](a,e); });
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ if(S.modal){closeModal();return;} if(S.panel){S.panel=null;renderLayers();return;} if(S.quickOpen&&window.HANDLERS.quickClose){window.HANDLERS.quickClose();return;} document.body.classList.remove('drawer-open'); }
  if((e.key==='n'||e.key==='т'||e.key==='N')&&!e.target.closest('input,textarea,select')&&S.role==='client'&&!e.ctrlKey&&!e.metaKey){ e.preventDefault(); window.HANDLERS.quick&&window.HANDLERS.quick(); }
});
function hrefState(st){ const prev=S.state; S.state=st; const h=href(S.route+(S.param?'/'+S.param:'')); S.state=prev; return h; }
window.addEventListener('hashchange',()=>document.body.classList.remove('drawer-open'));

window.UI={$,$$,esc,num,money,rub,pct,delta,ic,DEMO_B,MANUAL_B,FC_B,EST_B,assume,ASSUME,stamp,stampSrc,stampText,src,kcell,card,empty,chartNet,toast,openModal,closeModal,openPanel,renderLayers,render,go,href,hrefState,S,D,NAME,MINUS,NB};
window.addEventListener('DOMContentLoaded',render);
})();
