/* Финвеха — экраны клиента, часть 1: Главная (B1), быстрая запись (B4), Счета, Операции (C5/C6), Бюджет (C10), Обязательства (C16/C17) */
(function(){
const U=window.UI, {S,D,ic,rub,money,pct,delta,num,DEMO_B,MANUAL_B,FC_B,EST_B,assume,stamp,stampSrc,stampText,src,kcell,card,empty,href,esc}=U;
const SC=window.SCREENS={}, H=window.HANDLERS={};
const T='28.10.2026';

/* общие действия в шапке клиента */
function clientActions({quick=true,period=true,refresh=true}={}){
  let h='';
  if(quick) h+=`<div class="quick-wrap"><button class="quick" data-act="quick" aria-haspopup="dialog" aria-expanded="${S.quickOpen}" aria-label="Записать операцию одной строкой (клавиша N)"><span class="plus">+</span><span class="txt">Записать: «350 кофе»</span><kbd>N</kbd></button>${S.quickOpen?quickPop():''}</div>`;
  if(period) h+=`<div class="seg hide-m" role="radiogroup" aria-label="Период">${['Месяц','3 мес','Год','С начала года','Всё'].map((p,i)=>`<button role="radio" aria-checked="${i===0}" class="${i===0?'on':''}" data-act="period" data-v="${p}">${i===0?'Октябрь 2026':p}</button>`).join('')}</div>`;
  if(refresh) h+=`<button class="btn hide-m" data-act="refresh">${ic('refresh')}Обновить</button>`;
  return h;
}
H.period=a=>{ U.$$('[data-act=period]').forEach(b=>{b.classList.toggle('on',b===a);b.setAttribute('aria-checked',b===a);}); U.toast(`Период «${a.dataset.v}» — в прототипе данные только за октябрь 2026`); };
H.refresh=()=>U.toast('Обновлено: 5 источников · 28.10.2026, 19:42 МСК');

/* ---------- B4: быстрая запись одной строкой (Q2 решён: строка + обычная форма) */
const RULES=[[/коф|кафе|ресторан|обед|ужин/i,'Кафе и рестораны'],[/такси|метро|бензин|парковк/i,'Транспорт'],[/продукт|пят[её]рочк|магнит|перекр[её]ст|вкусвилл/i,'Продукты'],[/аптек|врач|клиник/i,'Здоровье'],[/кино|театр|концерт/i,'Развлечения'],[/зарплат|аванс/i,'Зарплата']];
function parseLine(v){
  const m=String(v||'').trim().match(/^([+−-]?)\s*(\d[\d\s]*(?:[.,]\d{1,2})?)\s*(?:₽|р\.?|руб\.?)?\s*(.*)$/i);
  if(!m) return null;
  const amt=parseFloat(m[2].replace(/\s/g,'').replace(',','.')); const desc=m[3].trim()||'Без описания';
  const r=RULES.find(([re])=>re.test(desc)); const cat=r?r[1]:null;
  const income=m[1]==='+'||cat==='Зарплата';
  return {amt:income?amt:-amt,desc,cat,type:income?'Доход':'Расход'};
}
function quickPop(){
  const v=S.quickVal===undefined?'':S.quickVal; const p=parseLine(v);
  const chips=p?`<div class="parse" aria-live="polite"><div class="small t3">Предпросмотр разбора — проверьте перед записью:</div><div class="chips">
    <button class="chip on" data-act="stub" data-msg="Тип: Расход / Доход / Перевод — в полной форме">${p.type}</button>
    <button class="chip on num">${money(p.amt)}</button>
    ${p.cat?`<button class="chip on" data-act="stub" data-msg="Категория из правил автокатегорий §2.4; исправление запомним">${p.cat}</button>`:`<button class="chip warn" data-act="stub" data-msg="Категория не распознана — выберите">Без категории?</button>`}
    <button class="chip" data-act="stub" data-msg="Счёт — последний использованный">Т-Банк · карта</button>
    <button class="chip" data-act="stub" data-msg="Время не указываем, если его нет (§8.12)">Сегодня, 28.10.2026</button></div>
    <div class="small t3">«${esc(p.desc)}» · категория — по правилам автокатегорий (§2.4), исправление запомним</div></div>`
    : (v?`<div class="parse"><div class="field"><span class="err">${ic('alert','i-s')} Не нашли сумму. Начните строку с числа: «350 кофе» или «+15000 возврат долга».</span></div></div>`:`<div class="parse small t3">Формат: «сумма описание». Например: «350 кофе», «1 890 такси», «+15000 возврат долга».</div>`);
  return `<div class="pop" role="dialog" aria-label="Быстрая запись операции"><div class="row" style="margin-bottom:8px"><b>Записать операцию</b><button class="btn ghost sm" data-act="quickClose" aria-label="Закрыть">${ic('x')}</button></div>
  <div class="field"><label for="qe">Сумма и описание</label><div class="qe-input"><input id="qe" class="inp" data-input="quickInput" value="${esc(v)}" placeholder="350 кофе" autocomplete="off" aria-describedby="qe-h"><button class="btn primary" data-act="quickSave" ${p?'':'disabled'}>Записать</button></div><span class="hint" id="qe-h">Enter — записать · Esc — закрыть</span></div>
  ${chips}<hr class="d"><div class="row small"><button class="link" data-act="fullForm">Подробнее — полная форма (перевод, обмен, корректировка)</button><span class="t3">Факт, не прогноз</span></div></div>`;
}
H.quick=()=>{ if(S.role!=='client')return; S.quickOpen=true; if(S.quickVal===undefined)S.quickVal=''; U.render(); setTimeout(()=>{const i=U.$('#qe'); if(i){i.focus(); i.setSelectionRange(i.value.length,i.value.length);}},0); };
H.quickClose=()=>{ S.quickOpen=false; S.quickVal=undefined; if(S.route==='quick') U.go(href('home')); else U.render(); };
H.quickInput=(a)=>{ S.quickVal=a.value; const pop=a.closest('.pop'); const pos=a.selectionStart; pop.outerHTML=quickPop(); const i=U.$('#qe'); i.focus(); i.setSelectionRange(pos,pos); };
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.id==='qe'){ e.preventDefault(); H.quickSave(); } });
H.quickSave=()=>{ const p=parseLine(S.quickVal); if(!p) return; const op={id:'q'+Date.now(),d:T,t:p.amt>0?'income':'expense',amt:p.amt,desc:p.desc[0].toUpperCase()+p.desc.slice(1),cat:p.cat||'?',acc:'tb',src:'Вручную',manual:true,review:p.cat?false:'Категория не выбрана'};
  S.ops.unshift(op); S.quickOpen=false; S.quickVal=undefined; if(S.route==='quick') U.go(href('home')); else U.render();
  U.toast(`Записано · ${p.cat||'без категории'} · ${money(p.amt)} · Т-Банк · карта`,{undo:()=>{S.ops=S.ops.filter(o=>o!==op); U.render();}}); };
H.fullForm=()=>{ S.quickOpen=false; U.openModal({title:'Новая операция — полная форма (C7)',ok:'Записать',body:`<div class="form-grid">
  <div class="field full"><span class="lab">Тип</span><div class="seg">${['Расход','Доход','Перевод между своими','Возврат','Корректировка','Обмен валюты'].map((t,i)=>`<button class="${i?'':'on'}" data-act="segpick">${t}</button>`).join('')}</div></div>
  <div class="field"><label for="ff-a">Сумма, ₽</label><input id="ff-a" class="inp num" value="${S.quickVal&&parseLine(S.quickVal)?num(Math.abs(parseLine(S.quickVal).amt)):''}" inputmode="decimal"></div>
  <div class="field"><label for="ff-d">Дата</label><input id="ff-d" class="inp" value="28.10.2026"><span class="hint">Время — только если известно</span></div>
  <div class="field"><label for="ff-acc">Счёт</label><select id="ff-acc" class="inp">${D.accounts.map(a=>`<option>${a.name}</option>`).join('')}</select></div>
  <div class="field"><label for="ff-c">Категория</label><select id="ff-c" class="inp"><option>Кафе и рестораны</option><option>Продукты</option><option>Транспорт</option><option>Здоровье</option></select></div>
  <div class="field full"><label for="ff-n">Описание / контрагент</label><input id="ff-n" class="inp"></div>
  <div class="field full"><span class="hint">Корректировка требует причину; перевод между своими не попадает в доходы и расходы (§2.3).</span></div></div>`,
  onOk:()=>U.toast('Операция записана (демо)')}); };
H.segpick=a=>{ U.$$('button',a.parentNode).forEach(b=>b.classList.toggle('on',b===a)); };

/* ---------- B1 Главная */
SC.home=SC.quick=(p,{calc:c})=>{
  if(S.route==='quick'&&S.quickVal===undefined){ S.quickOpen=true; S.quickVal='350 кофе'; }
  const st=S.state, partial=st==='partial';
  const nwSub=`<div class="num small" style="margin-top:2px">${delta(D.netChange,`${rub(D.netChange,{sign:true})} · +2,6 % за октябрь`)}</div><div class="stamp">активы ${rub(c.assets)} − обязательства ${rub(c.liab)}</div>`+
     (st==='stale'?`<div class="stamp stale">${ic('clock','i-s')}на 28.10.2026, 19:40 МСК · Сбербанк на 21.10, Мосбиржа на 26.10</div>`:st==='error'?`<div class="stamp err">${ic('x','i-s')}на 28.10.2026, 19:40 МСК · БКС — данные на 27.10, импорт 28.10 не удался</div>`:`<div class="stamp">на 28.10.2026, 19:40 МСК · 5 источников: Т-Банк, Сбербанк, БКС, Мосбиржа, ЦБ РФ</div>`);
  const empty1=st==='empty';
  const band=empty1?`<div class="strip">${kcell('Чистый капитал','нет данных','<div class="stamp">добавьте счета или импортируйте выписку</div>',{na:true})}${['Деньги на счетах','Портфель','Обязательства','Доходы − расходы'].map(l=>kcell(l,'нет данных','',{na:true})).join('')}</div>`:
  `<div class="strip">${kcell(`Чистый капитал = активы − обязательства ${DEMO_B}${partial?'<span class="bdg bdg-warn">Частично</span>':''}`,rub(c.net),nwSub+(partial?`<div class="stamp stale">${ic('alert','i-s')}без учёта: валютный счёт Т-Банка (не загружен)</div>`:''))}
   ${kcell('Деньги на счетах · вкл. вклад',rub(c.cash),st==='stale'?`<div class="stamp stale">${ic('clock','i-s')}Сбербанк: на 21.10 · 7 дн.</div>`:`<div class="stamp">${c.accs.length} счетов · $ по курсу ЦБ РФ на 28.10</div>`,{href:href('accounts')})}
   ${kcell('Портфель · БКС',rub(c.portfolio),st==='error'?`<div class="stamp err">${ic('x','i-s')}данные на 27.10 · импорт не удался</div>`:`<div class="small up num">▲ +18 240 ₽ · +0,7 %</div><div class="stamp">отчёт 27.10 · Мосбиржа 18:45</div>`,{href:href('portfolio')})}
   ${kcell(`Обязательства ${MANUAL_B}`,U.money(-c.liab,{dec:0}),`<div class="stamp">3 долга · обновлено 25.10.2026</div>`,{href:href('liabilities')})}
   ${kcell('Доходы − расходы · окт.',rub(D.income-D.expense,{sign:true}),`<div class="stamp">+254 118 − 163 580 · без переводов</div>`)}</div>`;
  const pay=D.payouts.filter(x=>x.st==='fc').slice(0,3).concat(D.payouts.filter(x=>x.d==='23.10.2026'));
  const payH=`<div class="events">${pay.map(x=>`<div class="ev ${x.st}"><div><div class="nm">${x.kind} · ${x.what}</div><div class="small t3">${x.d} · ${x.qty} шт.${x.note?' · '+x.note:''}</div></div><div class="r">${x.st==='fc'?`<div class="num fc-val">≈ ${rub(x.amt,{sign:true})}</div>${FC_B('Ожидается')}`:`<div class="num up">${rub(x.amt,{sign:true})}</div><span class="bdg bdg-ok">✓ Получено</span>`}</div></div>`).join('')}</div>${st==='error'?`<div class="errline">${ic('x','i-s')}График из отчёта БКС на 27.10 — новый отчёт не загружен</div>`:stamp('график — из отчёта БКС 27.10.2026; ожидаемые суммы — оценка до подтверждения поступления')}<div style="margin-top:8px"><a class="link small" href="${href('payouts')}">Весь календарь выплат →</a></div>`;
  const b=D.budget, pf=Math.round(b.spent/b.limit*1000)/10;
  const fcCash=c.cash+D.regular.reduce((s,r)=>s+r.amt,0)-150000;
  const body=`
  <section class="card s8 ${st==='stale'?'':''}"><div class="card-h"><h2>История чистого капитала</h2><div class="acts"><div class="legend"><span><i class="sw line"></i>Факт</span><span><i class="sw dline"></i>Прогноз</span></div><div class="seg">${['3 мес','Год','Всё'].map((x,i)=>`<button class="${i===1?'on':''}" data-act="segpick">${x}</button>`).join('')}</div>${DEMO_B}</div></div>${U.chartNet(780,220)}
   ${stamp('факт — остатки на конец месяца, ценные бумаги по Мосбирже, валюта по курсу ЦБ РФ на дату; прогноз — регулярные платежи и ожидаемые выплаты, не гарантирован')}</section>
  ${card('Купоны и дивиденды · БКС',payH,{cls:'s4'+(st==='error'?' err-bar':'')})}
  ${card('Доходы и расходы · октябрь',`<ul class="list num"><li><span>↓ Доходы</span><b class="up">${rub(D.income,{sign:true})}</b></li><li><span>↑ Расходы</span><b>${U.money(-D.expense,{dec:0})}</b></li><li><span class="neutral">⇄ Переводы между своими<div class="small t3">не доход и не расход</div></span><span class="neutral">60 000 ₽</span></li><li><span class="neutral">Погашение основного долга<div class="small t3">уменьшает обязательство, не расход (§8.9)</div></span><span class="neutral">9 700 ₽</span></li></ul>${stamp('операции за 01–28.10.2026 · Т-Банк, Сбербанк, вручную')}<a class="link small" href="${href('operations')}">Все операции →</a>`,{cls:'s4'})}
  ${card('Бюджет месяца',`<div class="num"><span class="kpi">${rub(b.spent)}</span> <span class="t3">из ${rub(b.limit)}</span></div><div class="bar" style="margin:10px 0 8px" role="img" aria-label="Потрачено ${pf} процента, прогноз до конца месяца ещё ${Math.round((b.forecast-b.spent)/b.limit*100)} процентов"><div class="fact acc" style="width:${pf}%"></div><div class="fc" style="width:${(b.forecast-b.spent)/b.limit*100}%"></div></div><div class="legend num"><span><i class="sw f acc"></i>Факт ${num(pf,1)} %</span><span><i class="sw p"></i>Прогноз до 31.10 ≈ ${rub(b.forecast)}</span></div><div class="num" style="margin-top:8px">Остаток лимита: <b>${rub(b.limit-b.spent)}</b></div><a class="link small" href="${href('budget')}">Бюджет →</a>`,{cls:'s4'})}
  ${card(`Регулярные платежи ${FC_B()}`,`<ul class="list">${D.regular.map(r=>`<li><span><span class="t3 num">${r.d.slice(0,5)}</span> ${r.amt>0?'↓ ':''}${r.name}</span><span class="num fc-val">≈ ${rub(r.amt,{sign:true})}</span></li>`).join('')}</ul>${stamp('не входят в факт до подтверждения поступления/списания')}`,{cls:'s4'})}
  ${card('Цели',`<ul class="list">${S.goals.slice(0,2).map(g=>`<li style="flex-direction:column;align-items:stretch;gap:6px"><div class="row"><a href="${href('goals')}">${g.name}</a><span class="num"><b>${rub(g.saved)}</b> <span class="t3">из ${rub(g.target)}</span></span></div><div class="bar" style="height:6px"><div class="fact acc" style="width:${Math.min(100,g.saved/g.target*100)}%"></div></div><div class="small t3">резерв: ${g.from} · ${Math.round(g.saved/g.target*100)} %</div></li>`).join('')}</ul>${stamp('резервы — распределение денег, не увеличивают чистый капитал (§8.10)')}`,{cls:'s4'})}
  ${card(`Краткосрочный прогноз · до 30.11 ${FC_B()}`,`<div class="num"><span class="kpi fc-val">≈ ${rub(fcCash)}</span> <span class="t3">на счетах</span></div><ul class="list num small" style="margin-top:6px"><li><span class="muted">Сейчас на счетах</span><span>${rub(c.cash)}</span></li><li><span class="muted">Регулярные (5)</span><span class="fc-val">≈ ${rub(D.regular.reduce((s,r)=>s+r.amt,0),{sign:true})}</span></li><li><span class="muted">Прочие расходы по среднему</span><span class="fc-val">≈ −150 000 ₽</span></li></ul>${stamp('оценка, не факт; купоны зачисляются у брокера и сюда не входят')}`,{cls:'s4'})}
  ${card('Рекомендация консультанта',`<div class="note public"><div class="who">Анна Соколова · опубликовано для вас 25.10.2026</div><div>${D.notes.find(n=>n.kind==='public').text}</div></div><div style="margin-top:8px">${assume('A-04')}</div>`,{cls:'s4',demo:true})}
  `;
  return {title:'Главная',stamp:`Сводка на 28.10.2026, 19:40 МСК · 5 источников${st==='stale'?', 2 устарели':st==='error'?', 1 с ошибкой':''}`,actions:clientActions(),band,kpiN:5,body,resp:true,
    empty:empty('Данных пока нет','Чистый капитал появится, когда вы добавите счёт или загрузите выписку банка / отчёт брокера. Нули не показываем — это не настоящие значения.',`<button class="btn primary" data-act="stub" data-msg="Добавление счёта — экран C4">${ic('plus')}Добавить счёт</button><a class="btn" href="${href('import')}">Импорт выписки</a><a class="btn" href="${href('import/broker')}">Импорт отчёта брокера</a>`),
    confirm:{_state:true,title:'Архивировать счёт «Наличные»?',body:'<p>Счёт исчезнет из итогов и списков. <b>История операций сохранится</b>, счёт можно вернуть из архива.</p><ul><li>Чистый капитал уменьшится на 12 000 ₽</li><li>Операций в истории: 14</li></ul>',ok:'Архивировать',danger:true,onOk:()=>U.toast('Счёт «Наличные» в архиве (демо)')}};
};

/* ---------- Счета (C2) — вклады живут здесь (Q12) */
SC.accounts=(p,{calc:c})=>{
  const rows=c.accs.map(a=>{const s=src(a.src); const stale=s.stale; return `<tr><td class="first" data-label="Счёт"><b>${a.name}</b><span class="sub">${a.type}${a.id==='dep'?` · ${a.rate} до ${a.until} · капитализация ${a.cap}`:''}</span></td><td data-label="Валюта">${a.cur}</td><td class="r num" data-label="Остаток">${a.cur==='USD'?`${U.money(a.orig,{cur:'$'})}<span class="sub">≈ ${money(a.bal)} · ЦБ РФ на 28.10.2026</span>`:money(a.bal)}</td><td data-label="Источник">${a.src==='manual'?MANUAL_B+` <span class="small t3">${a.manualDate}</span>`:`<span class="small ${stale?'':'t3'}" style="${stale?'color:var(--color-warning-text)':''}">${stampText(a.src)}${stale?' · устарело':''}</span>`}</td></tr>`;}).join('');
  const dep=D.accounts.find(a=>a.id==='dep');
  return {title:'Счета',crumbs:'Личные финансы',stamp:'5 счетов · на 28.10.2026, 19:40 МСК',actions:clientActions({period:false}),kpiN:4,
   band:`<div class="strip c4">${kcell(`Деньги на счетах ${DEMO_B}`,rub(c.cash),'<div class="stamp">учитываются в чистом капитале один раз</div>')}${kcell('в т. ч. вклады',rub(dep.bal),'<div class="stamp">вклады — здесь, не в портфеле (Q12)</div>')}${kcell('Рублёвые карты и счета',rub(c.cash-dep.bal-(c.accs.find(a=>a.id==='usd')?127624:0)),'')}${kcell('Валюта',S.state==='partial'?'нет данных':'1 400,00 $','<div class="stamp">ЦБ РФ · курс на 28.10.2026</div>')}</div>`,
   body:card('Счета',`<div class="tbl-wrap"><table class="cards"><thead><tr><th>Счёт</th><th>Валюта</th><th class="r">Остаток</th><th>Источник и дата</th></tr></thead><tbody>${rows}<tr class="total"><td class="first">Итого</td><td></td><td class="r num" data-label="Итого">${money(c.cash)}</td><td></td></tr></tbody></table></div>`,{cls:'s8'})+
     card(`Вклад «Накопительный» · прогноз процентов ${FC_B()}`,`<dl class="dl"><dt>Сумма</dt><dd class="num">${money(dep.bal)}</dd><dt>Ставка</dt><dd>${dep.rate} годовых</dd><dt>Срок</dt><dd>14.03.2026 – 14.03.2027</dd><dt>Капитализация</dt><dd>не указана ${MANUAL_B}</dd><dt>Проценты к сроку</dt><dd class="num fc-val">≈ ${rub(dep.forecast,{sign:true})}</dd></dl><div class="warnline">${ic('alert','i-s')}Условия капитализации неизвестны — прогноз приблизительный (§3.7)</div>`,{cls:'s4'}),
   resp:true};
};

/* ---------- C5 Операции + C6 карточка операции */
const TYPES={expense:['↑','Расход'],income:['↓','Доход'],transfer:['⇄','Перевод между своими'],refund:['↺','Возврат'],fee:['↑','Комиссия'],fx:['⇄','Обмен валюты'],adjust:['⚙','Корректировка'],principal:['↘','Погашение основного долга']};
function opAmt(o){ if(o.t==='transfer'||o.t==='fx'||o.t==='principal') return `<span class="neutral num">${money(Math.abs(o.amt))}</span>`; if(o.amt>0) return `<span class="up num">${money(o.amt,{sign:true})}</span>`; return `<b class="num">${money(o.amt)}</b>`; }
SC.operations=()=>{
  const f=S.opsFilter||'all', qv=(S.opsQ||'').toLowerCase();
  let ops=S.ops.filter(o=>f==='all'||(f==='review'&&o.review)||(f==='income'&&o.amt>0&&o.t!=='transfer')||(f==='expense'&&o.amt<0&&!['transfer','fx','principal'].includes(o.t))||(f==='transfer'&&['transfer','fx','principal'].includes(o.t)));
  if(qv) ops=ops.filter(o=>(o.desc+o.cat).toLowerCase().includes(qv));
  const nRev=S.ops.filter(o=>o.review).length;
  const accName=id=>({tb:'Т-Банк · карта',sb:'Сбербанк · текущий',cash:'Наличные',bks:'БКС · брокерский'}[id]||id);
  const stale=S.state==='stale';
  const rows=ops.map(o=>{const [i,t]=TYPES[o.t]; const sstale=stale&&o.acc==='sb';
    return `<tr class="clk${o.review?' review':''}" data-act="opOpen" data-id="${o.id}" tabindex="0"><td class="first num" data-label="Дата">${o.d}</td><td data-label="Описание"><b>${esc(o.desc)}</b><span class="sub">${o.src}${o.manual?' · вручную':''}</span></td><td data-label="Категория">${o.cat==='?'?'<span class="bdg bdg-warn">Не выбрана</span>':esc(o.cat)}${o.review?` <span class="bdg bdg-review" title="${esc(o.review)}">На проверку</span>`:''}</td><td data-label="Счёт">${accName(o.acc)}${sstale?' <span class="bdg bdg-warn" title="Выписка на 21.10.2026">устарело</span>':''}</td><td data-label="Тип"><span aria-hidden="true">${i}</span> ${t}</td><td class="r" data-label="Сумма">${opAmt(o)}</td></tr>`;}).join('');
  const body=`<section class="card s12"><div class="row filters" style="margin-bottom:10px;flex-wrap:wrap;align-items:flex-end">
    <div class="row-l"><div class="field" style="width:220px"><label for="ops-q">Поиск</label><input id="ops-q" class="inp" data-input="opsQ" value="${esc(S.opsQ||'')}" placeholder="Описание или категория"></div>
    <div class="field"><label for="ops-acc">Счёт</label><select id="ops-acc" class="inp" style="width:190px"><option>Все счета</option><option>Т-Банк · карта</option><option>Сбербанк · текущий</option><option>Наличные</option></select></div>
    <div class="field"><label for="ops-src">Источник</label><select id="ops-src" class="inp" style="width:160px"><option>Все</option><option>Импорт</option><option>Вручную</option></select></div>
    <div class="field"><span class="lab">Тип</span><div class="seg" role="radiogroup" aria-label="Тип операции">${[['all','Все'],['expense','Расходы'],['income','Доходы'],['transfer','Переводы'],['review',`На проверку · ${nRev}`]].map(([k,t])=>`<button role="radio" aria-checked="${f===k}" class="${f===k?'on':''}" data-act="opsF" data-v="${k}">${t}</button>`).join('')}</div></div></div>
    <div class="row-l"><button class="btn" data-act="fullForm">${ic('plus')}Операция</button>${DEMO_B}</div></div>
    ${stale?`<div class="warnline" style="margin:0 0 8px">${ic('clock','i-s')}<span>Операции Сбербанка — по выписке на 21.10.2026 (7 дн. назад), более поздних может не быть. ${assume('A-01')}</span></div>`:''}
    <div class="tbl-wrap"><table class="cards"><thead><tr><th>Дата</th><th>Описание · источник</th><th>Категория</th><th>Счёт</th><th>Тип</th><th class="r">Сумма</th></tr></thead><tbody>${rows||`<tr><td colspan="6">${empty('Ничего не найдено','Измените фильтры или поисковый запрос.')}</td></tr>`}</tbody></table></div>
    ${stamp(`октябрь 2026 · ${ops.length} из ${S.ops.length} операций · расход — со знаком «−» основным цветом, доход — «+» зелёным, переводы и обмен — нейтрально`)}</section>`;
  return {title:'Операции',crumbs:'Личные финансы',stamp:'Октябрь 2026 · Т-Банк на 28.10, 09:15 МСК · Сбербанк на '+(stale?'21.10':'27.10'),actions:clientActions(),kpiN:4,resp:true,
   band:S.state==='empty'?`<div class="strip c4">${['Доходы','Расходы','Переводы между своими','На проверку'].map(l=>kcell(l,'нет данных','',{na:true})).join('')}</div>`:`<div class="strip c4">${kcell(`Доходы · октябрь ${DEMO_B}`,rub(D.income,{sign:true}),'<div class="stamp">зарплата, купоны, проценты</div>')}${kcell('Расходы · октябрь',U.money(-D.expense,{dec:0}),'<div class="stamp">91 % лимита бюджета</div>')}${kcell('Переводы между своими','60 000 ₽','<div class="stamp">не доход и не расход</div>')}${kcell('На проверку',String(nRev),'<div class="stamp">дубликаты, переводы, возвраты</div>')}</div>`,
   body, empty:empty('Операций пока нет','Загрузите выписку банка или запишите операцию вручную.',`<a class="btn primary" href="${href('import')}">Импорт выписки</a><button class="btn" data-act="quick">Записать операцию</button>`),
   confirm:{_state:true,title:'Удалить операцию «Яндекс Плюс» 21.10.2026?',body:'<p>Операция помечена как возможный дубликат. Удаление необратимо, запись попадёт в журнал изменений.</p><p class="small">Альтернатива: «Не дубликат» — оставить обе.</p>',ok:'Удалить',danger:true,onOk:()=>U.toast('Операция удалена (демо)')}};
};
H.opsF=a=>{ S.opsFilter=a.dataset.v; U.render(); };
H.opsQ=a=>{ S.opsQ=a.value; const pos=a.selectionStart; U.render(); const i=U.$('#ops-q'); i.focus(); i.setSelectionRange(pos,pos); };
H.opOpen=a=>{ const o=S.ops.find(x=>x.id===a.dataset.id); if(!o) return; U.$$('tr.sel').forEach(r=>r.classList.remove('sel')); a.classList.add('sel'); const [i,t]=TYPES[o.t];
  U.openPanel({route:'operations',title:esc(o.desc),sub:`<div class="small t3">Операция · ${o.d}</div>`,body:`
   <div class="big">${opAmt(o)}</div>
   ${o.review?`<div class="banner" style="border-color:var(--color-accent)"><span class="bdg bdg-review">На проверку</span><span class="grow small">${esc(o.review)}</span></div><div class="row-l"><button class="btn sm primary" data-act="stub" data-msg="Подтверждено (демо)">Подтвердить</button><button class="btn sm" data-act="stub" data-msg="Связь с операцией — экран C14">Связать…</button></div>`:''}
   <dl class="dl"><dt>Дата</dt><dd>${o.d} <span class="small t3">(время источник не передал)</span></dd><dt>Тип</dt><dd>${i} ${t}</dd><dt>Сумма и валюта</dt><dd class="num">${money(o.amt)} · RUB</dd><dt>Счёт</dt><dd>${({tb:'Т-Банк · карта',sb:'Сбербанк · текущий',cash:'Наличные',bks:'БКС'}[o.acc])}</dd><dt>Категория</dt><dd>${o.cat==='?'?'не выбрана':esc(o.cat)}</dd><dt>Источник</dt><dd>${o.src}${o.manual?' '+MANUAL_B:''}</dd><dt>Исходный ID</dt><dd class="num small">${o.manual?'—':'TB-2026-10-'+o.id.toUpperCase()}</dd>${o.reason?`<dt>Причина</dt><dd>${o.reason}</dd>`:''}</dl>
   <div><div class="small t3" style="margin-bottom:4px">История изменений</div><ul class="list small"><li><span>${o.d} · импорт / ввод</span><span class="t3">${o.src}</span></li>${o.cat!=='?'?`<li><span>${o.d} · категория по правилу</span><span class="t3">автокатегория §2.4</span></li>`:''}</ul></div>
   <div class="row-l"><button class="btn sm" data-act="stub" data-msg="Разделение по категориям — экран C8">Разделить по категориям</button><button class="btn sm" data-act="fullForm">Изменить</button></div>${DEMO_B}`}); };
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target.matches('tr[data-act=opOpen]')) H.opOpen(e.target); });

/* ---------- C10 Бюджет */
SC.budget=()=>{
  const b=D.budget, pf=b.spent/b.limit*100, fcp=(b.forecast-b.spent)/b.limit*100, max=b.cats[0][1];
  return {title:'Бюджет месяца',crumbs:'Личные финансы',stamp:'Октябрь 2026 · операции на 28.10.2026 · осталось 3 дня',actions:clientActions(),kpiN:5,resp:true,
   band:`<div class="strip">${kcell(`Потрачено (факт) ${DEMO_B}`,rub(b.spent),`<div class="stamp">${num(pf,1)} % лимита · 01–28.10.2026</div>`)}${kcell('Лимит месяца',rub(b.limit),'<div class="stamp">один общий лимит (§2.5)</div>')}${kcell('Остаток лимита',rub(b.limit-b.spent),'<div class="stamp">до 31.10.2026</div>')}${kcell(`Прогноз до 31.10 <span class="bdg bdg-fc">Прогноз</span>`,'≈ '+rub(b.forecast),'<div class="stamp">регулярные + среднее за день</div>')}${kcell('Прогноз остатка','≈ '+rub(b.limit-b.forecast),'<div class="stamp">в пределах лимита</div>')}</div>`,
   body:card('Использование лимита',`<div class="bar" style="height:22px" role="img" aria-label="Факт ${Math.round(pf)} процентов, прогноз ещё ${Math.round(fcp)} процентов"><div class="fact acc" style="width:${pf}%"></div><div class="fc" style="width:${fcp}%"></div></div>
     <div class="row" style="margin-top:8px"><div class="legend num"><span><i class="sw f acc"></i>Факт ${rub(b.spent)} · ${num(pf,1)} %</span><span><i class="sw p"></i>Прогноз ещё ≈ ${rub(b.forecast-b.spent)}</span><span>Лимит ${rub(b.limit)}</span></div><button class="btn sm" data-act="limit">Изменить лимит</button></div>
     ${stamp('факт — подтверждённые операции; прогноз — регулярные платежи до 31.10 и средний дневной расход; переводы между своими и погашение основного долга не входят')}`,{cls:'s12'})+
     card('Расходы по категориям · факт',`<div class="tbl-wrap"><table><thead><tr><th>Категория</th><th class="r">Факт</th><th class="r">Доля</th><th style="width:40%"></th></tr></thead><tbody>${b.cats.map(([n,v])=>`<tr><td>${n}${n==='Проценты по кредитам'?'<span class="sub">только проценты ипотеки — основной долг не расход (§8.9)</span>':''}</td><td class="r num">${money(-v)}</td><td class="r num">${num(v/b.spent*100,1)} %</td><td><div class="bar" style="height:8px"><div class="fact" style="width:${v/max*100}%"></div></div></td></tr>`).join('')}<tr class="total"><td>Итого</td><td class="r num">${money(-b.spent)}</td><td class="r">100 %</td><td></td></tr></tbody></table></div>`,{cls:'s8'})+
     card(`Учтено в прогнозе ${U.FC_B()}`,`<ul class="list">${[['29.10','Продукты, среднее за 3 дня',-5400],['30.10','Кафе, среднее',-1520],['31.10','Подписка (кино)',-1400]].map(([d,n,v])=>`<li><span><span class="t3 num">${d}</span> ${n}</span><span class="num fc-val">≈ ${money(v,{dec:0})}</span></li>`).join('')}</ul>${stamp('регулярные платежи входят в прогноз, но не в факт до подтверждения (§2.6)')}`,{cls:'s4'}),
   empty:empty('Лимит не задан','Задайте общий месячный лимит — покажем факт, остаток и прогноз до конца месяца.',`<button class="btn primary" data-act="limit">Задать лимит</button>`),
   confirm:{_state:true,title:'Изменить лимит на 200 000 ₽?',body:'<p>Новый лимит действует с октября 2026. <b>История прошлых месяцев не меняется.</b></p>',ok:'Изменить',onOk:()=>U.toast('Лимит изменён (демо)')}};
};
H.limit=()=>U.openModal({title:'Лимит месяца',ok:'Сохранить',body:`<div class="field"><label for="lim">Лимит на октябрь 2026, ₽</label><input id="lim" class="inp num" value="180 000"><span class="hint">Изменение лимита не меняет историю прошлых месяцев.</span></div>`,onOk:()=>U.toast('Лимит сохранён (демо)')});

/* ---------- C16/C17 Обязательства (Q4 решён: ручной ввод, бейдж «Вручную», уменьшают чистый капитал) */
SC.liabilities=(p,{calc:c})=>{
  if(p==='new') return liabForm(c);
  const pays=S.liabs.reduce((s,l)=>s+(l.pay||0),0);
  const rows=S.liabs.map(l=>`<tr><td class="first" data-label="Обязательство"><b>${esc(l.name)}</b><span class="sub">${l.type}</span></td><td class="r num" data-label="Текущий остаток"><b>${money(-l.bal)}</b></td><td class="r num" data-label="Ставка">${l.rate}</td><td class="r num" data-label="Ежемесячный платёж">${l.pay?`<span class="fc-val">≈ ${rub(-l.pay)}</span><span class="sub">${l.payNote||'след. '+l.next}</span>`:'<span class="t3">графика нет</span>'}</td><td data-label="Источник">${MANUAL_B} <span class="small t3 num">обновлено ${l.date}</span></td><td class="r" data-label=""><button class="btn sm" data-act="stub" data-msg="Карточка обязательства — C18: график, основной долг / проценты">Открыть</button></td></tr>`).join('');
  return {title:'Обязательства',crumbs:'Личные финансы',stamp:'Кредиты и долги · ввод вручную · на 28.10.2026',actions:`<a class="btn primary" href="${href('liabilities/new')}" style="border-color:transparent">${ic('plus')}Добавить</a>`,kpiN:4,resp:true,
   band:`<div class="strip c4">${kcell(`Всего обязательств ${MANUAL_B} ${DEMO_B}`,U.money(-c.liab,{dec:0}),`<div class="stamp">${S.liabs.length} обязательства · текущий остаток, не сумма будущих платежей (§8.3)</div>`)}${kcell('Ежемесячные платежи <span class="bdg bdg-fc">Прогноз</span>','≈ '+rub(-pays),'<div class="stamp">в регулярных платежах</div>')}${kcell('Активы',rub(c.assets),'<div class="stamp">счета + портфель</div>',{href:href('home')})}${kcell('Чистый капитал',rub(c.net),'<div class="stamp">= активы − обязательства</div>',{href:href('home')})}</div>`,
   body:card('Обязательства',`<div class="tbl-wrap"><table class="cards"><thead><tr><th>Обязательство</th><th class="r">Текущий остаток</th><th class="r">Ставка</th><th class="r">Ежемесячный платёж</th><th>Источник и дата</th><th></th></tr></thead><tbody>${rows}<tr class="total"><td class="first">Итого — вычитается из чистого капитала</td><td class="r num" data-label="Итого">${money(-c.liab)}</td><td colspan="4"></td></tr></tbody></table></div>
     <div class="banner" style="margin-top:10px">${ic('info')}<span class="grow">Чистый капитал на главной: активы <b>${rub(c.assets)}</b> − обязательства <b>${rub(c.liab)}</b> = <b>${rub(c.net)}</b>. График платежей не заменяет текущий остаток (§8.9); основной долг уменьшает обязательство, проценты — расход.</span></div>
     ${stamp('все значения введены вручную · интеграции с банками для кредитов в MVP нет · напоминание обновить остаток — раз в месяц')}`,{cls:'s12'}),
   empty:empty('Обязательств нет','Если есть кредиты или долги, добавьте их — они уменьшат чистый капитал.',`<a class="btn primary" href="${href('liabilities/new')}">Добавить обязательство</a>`),
   confirm:{_state:true,title:'Закрыть долг «Долг · Андрей (брат)»?',body:'<p>Остаток 50 000 ₽ будет обнулён, обязательство уйдёт в архив. Чистый капитал увеличится на 50 000 ₽ — проверьте, что погашение отражено операцией.</p>',ok:'Закрыть долг',onOk:()=>U.toast('Долг закрыт (демо)')}};
};
function liabForm(c){
  return {title:'Новое обязательство',crumbs:`<a href="${href('liabilities')}">Обязательства</a> ›`,stamp:'Ручной ввод · значение получит бейдж «Вручную»',actions:'',kpiN:4,
   band:`<div class="strip c4">${kcell('Сейчас обязательств',U.money(-c.liab,{dec:0}),'')}${kcell('Чистый капитал сейчас',rub(c.net),'')}${kcell('После сохранения','<span id="lf-net">'+rub(c.net)+'</span>','<div class="stamp">уменьшится на остаток</div>')}${kcell('Источник',MANUAL_B,'<div class="stamp">интеграции нет</div>')}</div>`,
   body:`<section class="card s8"><div class="card-h"><h2>Обязательство</h2></div><form id="lf" class="form-grid" novalidate>
    <div class="field full"><span class="lab">Тип</span><div class="radio-cards">${['Ипотека','Потребительский кредит','Автокредит','Кредитная карта','Долг частному лицу','Другое'].map((t,i)=>`<label><input type="radio" name="lt" value="${t}"${i===1?' checked':''}> ${t}</label>`).join('')}</div></div>
    <div class="field"><label for="lf-n">Название / кредитор</label><input id="lf-n" class="inp" value="Кредит наличными · ВТБ"></div>
    <div class="field"><label for="lf-b">Текущий остаток, ₽ *</label><input id="lf-b" class="inp num" inputmode="decimal" value="" data-input="lfCalc" aria-describedby="lf-b-h"><span class="hint" id="lf-b-h">Остаток долга на дату, не сумма всех будущих платежей</span><span class="err" id="lf-b-e" hidden>${ic('alert','i-s')} Укажите остаток — число больше 0</span></div>
    <div class="field"><label for="lf-d">Дата остатка *</label><input id="lf-d" class="inp" value="28.10.2026"></div>
    <div class="field"><label for="lf-c">Валюта</label><select id="lf-c" class="inp"><option>RUB — рубль</option><option>USD</option><option>EUR</option><option>CNY</option></select></div>
    <div class="field"><label for="lf-r">Ставка, % годовых</label><input id="lf-r" class="inp num" value="" placeholder="необязательно"></div>
    <div class="field"><label for="lf-p">Ежемесячный платёж, ₽</label><input id="lf-p" class="inp num" value="" placeholder="необязательно"><span class="hint">Попадёт в регулярные платежи как прогноз</span></div>
    <div class="field"><label for="lf-nx">Дата следующего платежа</label><input id="lf-nx" class="inp" placeholder="ДД.ММ.ГГГГ"></div>
    <div class="field full"><label for="lf-m">Комментарий</label><textarea id="lf-m" class="inp" placeholder="Например: условия досрочного погашения"></textarea></div>
    <div class="full row"><span class="small t3">* — обязательные поля</span><div class="row-l"><a class="btn" href="${href('liabilities')}">Отмена</a><button class="btn primary" type="button" data-act="lfSave">Сохранить</button></div></div></form></section>
    ${card('Как это влияет на капитал',`<p class="small muted">Чистый капитал = активы − обязательства (§8.3). Новое обязательство уменьшит его на сумму остатка. Платёж по графику не заменяет остаток (§8.9).</p><hr class="d"><div class="small">Бейджи:</div><div class="row-l" style="margin-top:6px">${MANUAL_B}<span class="small t3">введено вами</span></div><div class="row-l" style="margin-top:6px">${DEMO_B}<span class="small t3">демо-цифры</span></div><div class="row-l" style="margin-top:6px"><span class="small t3">Т-Банк · импорт выписки · 28.10 — источник-интеграция (текстом, без бейджа)</span></div>`,{cls:'s4',demo:false})}`,noDemoBanner:false};
}
H.lfCalc=a=>{ const v=parseFloat(a.value.replace(/\s/g,'').replace(',','.'))||0; const c=window.CALC(); const el=U.$('#lf-net'); if(el) el.textContent=rub(c.net-v); };
H.lfSave=()=>{ const b=U.$('#lf-b'), v=parseFloat(b.value.replace(/\s/g,'').replace(',','.')); const e=U.$('#lf-b-e');
  if(!(v>0)){ e.hidden=false; b.classList.add('bad'); b.setAttribute('aria-invalid','true'); b.focus(); return; }
  const t=(U.$('input[name=lt]:checked')||{}).value||'Другое'; const p=parseFloat((U.$('#lf-p').value||'').replace(/\s/g,'').replace(',','.'));
  S.liabs.push({id:'l'+Date.now(),type:t,name:U.$('#lf-n').value||t,bal:v,rate:U.$('#lf-r').value?U.$('#lf-r').value+' %':'—',pay:p>0?p:null,next:U.$('#lf-nx').value||null,date:U.$('#lf-d').value});
  U.go(href('liabilities')); setTimeout(()=>U.toast(`Обязательство добавлено · чистый капитал уменьшился на ${rub(v)}`),30); };

SC.notfound=()=>({title:'Экран не найден',body:`<div class="card s12">${empty('Такого экрана в прототипе нет','Вернитесь на главную.',`<a class="btn primary" href="${href(S.role==='client'?'home':'clients')}">На главную</a>`)}</div>`,noDemoBanner:true});
window.clientActions=clientActions;
})();
