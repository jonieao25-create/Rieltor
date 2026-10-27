/* Движок мини-приложения риелтора. Общий для всех клиентов.
   Перенесён из живого приложения Евгения (репозиторий 1): разделы,
   страницы посёлков и домов, планировки, карты, заявки через бота.
   Всё содержимое клиента — в clients/<id>/data.js. */

// Разметка страницы (одинаковая у всех клиентов)
document.body.insertAdjacentHTML('afterbegin', `
<div class="app">

  <!-- ===== HOME ===== -->
  <section id="view-home">
    <div class="sec-tabs" id="secTabs"></div>
    <div class="home-head">
      <div class="agent" id="agent" hidden></div>
      <div class="svc" id="services" hidden></div>
      <div class="eyebrow"></div>
      <h1></h1>
      <div class="points" id="points" hidden></div>
      <p></p>
    </div>
    <div class="list" id="list"></div>
  </section>

  <!-- ===== DETAIL ===== -->
  <section id="view-detail" hidden>
    <div class="topbar">
      <button class="back-btn" id="backBtn" aria-label="Назад">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div>
        <div class="topbar-title" id="dTitle">—</div>
        <div class="topbar-sub" id="dSub">—</div>
      </div>
    </div>

    <div class="hero" id="dHero">
      <div class="hero-slides" id="dHeroSlides"></div>
      <div class="hero-shade"></div>
      <svg class="deco" width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="10" y="20" width="12" height="34" fill="currentColor" opacity=".35"/><rect x="26" y="8" width="14" height="46" fill="currentColor" opacity=".55"/><rect x="44" y="26" width="10" height="28" fill="currentColor" opacity=".3"/></svg>
      <button class="hero-arrow prev" id="dHeroPrev" aria-label="Предыдущее фото">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="hero-arrow next" id="dHeroNext" aria-label="Следующее фото">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="hero-counter" id="dHeroCounter">1/4</div>
      <div class="hero-content">
        <span class="class-badge" id="dClassBadge">—</span>
        <h2 id="dName">—</h2>
        <div class="hero-bottom">
          <div class="addr" id="dAddr">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.4" stroke="currentColor" stroke-width="2"/></svg>
            <span>—</span>
          </div>
          <div class="hero-dots" id="dHeroDots"></div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="quickfacts" id="dQuick"></div>
    </div>

    <div class="section">
      <div class="section-title">Цены на квартиры</div>
      <div class="tabs" id="dTabs" role="tablist"></div>
      <div class="price-card" id="dPriceCard"></div>
    </div>

    <div class="section">
      <div class="section-title">Характеристики дома</div>
      <div class="specs" id="dSpecs"></div>
    </div>

    <div class="section">
      <div class="section-title">Условия покупки</div>
      <div class="chips" id="dConditions"></div>
    </div>

    <div class="section" id="dDistSection">
      <div class="section-title">Расположение</div>
      <div id="dMap"></div>
      <div class="distances" id="dDistances"></div>
    </div>

    <div class="section">
      <div class="section-title">Особенности</div>
      <div class="features" id="dFeatures"></div>
    </div>

    <div class="cta-space"></div>
  </section>

  <!-- ===== COTTAGE VILLAGE (своя страница посёлка) ===== -->
  <section id="view-village" hidden>
    <div class="topbar">
      <button class="back-btn" id="vBackBtn" aria-label="Назад">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div>
        <div class="topbar-title" id="vTitle">—</div>
        <div class="topbar-sub" id="vSub">—</div>
      </div>
    </div>
    <div class="v-hero">
      <div class="v-slides" id="vSlides"></div>
      <div class="v-shade"></div>
      <div class="v-logo" id="vLogo"></div>
      <span class="v-count" id="vCount"></span>
      <button class="v-arrow prev" id="vPrev" type="button" aria-label="Предыдущее фото">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="v-arrow next" id="vNext" type="button" aria-label="Следующее фото">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="v-addr">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.4" stroke="currentColor" stroke-width="2"/></svg>
        <span id="vAddr"></span>
      </div>
      <div class="v-dots" id="vDots"></div>
    </div>
    <div class="v-green" id="vHeadline"></div>
    <div class="v-perks" id="vPerks"></div>
    <div class="v-tagline" id="vTagline"></div>
    <div class="v-hbtns" id="vHouseBtns"></div>
    <div class="v-houses" id="vHouses"></div>
    <div id="vMapSection" hidden>
      <h2 class="v-green">Расположение</h2>
      <div id="vMap" style="margin-top:14px"></div>
    </div>
    <p class="v-lead" id="vCondLead"></p>
    <h2 class="v-green" id="vCondTitle"></h2>
    <div class="v-conds" id="vConds"></div>
    <button class="v-btn center" type="button" id="vConsult"></button>
    <div class="cta-space"></div>
  </section>

  <!-- ===== HOUSE (страница одного дома в посёлке) ===== -->
  <section id="view-house" hidden>
    <div class="topbar">
      <button class="back-btn" id="hBackBtn" aria-label="Назад к посёлку">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div>
        <div class="topbar-title" id="hTopTitle">—</div>
        <div class="topbar-sub" id="hTopSub">—</div>
      </div>
    </div>
    <div class="v-hero">
      <div class="v-slides" id="hSlides"></div>
      <span class="v-count" id="hCount"></span>
      <button class="v-arrow prev" id="hPrev" type="button" aria-label="Предыдущее фото">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="v-arrow next" id="hNext" type="button" aria-label="Следующее фото">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <h2 class="h-title" id="hTitle"></h2>
    <div class="h-price" id="hPrice"></div>
    <div class="h-facts" id="hFacts"></div>
    <div class="h-note" id="hNote" hidden></div>
    <div id="hRoomsBox">
      <h3 class="h-sub">Площади помещений</h3>
      <div class="h-rooms" id="hRooms" style="margin-top:10px"></div>
    </div>
    <div id="hPlanBox" style="display:flex; flex-direction:column; gap:10px">
      <h3 class="h-sub">Планировка</h3>
      <div class="h-tabs" id="hPlanTabs"></div>
      <button class="v-plan" type="button" id="hPlan" aria-label="Увеличить планировку"><img alt="Планировка"></button>
      <div class="v-plan-hint">Нажмите на план, чтобы увеличить</div>
    </div>
    <div id="hSpecsBox" style="display:flex; flex-direction:column; gap:8px">
      <h3 class="h-sub">Как построен дом</h3>
      <div id="hSpecs" style="display:flex; flex-direction:column; gap:8px"></div>
    </div>
    <div class="cta-space"></div>
  </section>

  <footer class="app-foot" id="appFoot"></footer>
</div>

<div class="cta-bar" id="ctaBar" hidden>
  <div class="cta-inner">
    <button class="cta-btn" id="ctaBtn">Оставить заявку</button>
  </div>
</div>

<div class="modal-backdrop" id="modalBackdrop" hidden>
  <div class="modal" id="modalBody"></div>
</div>
`);

// Фото общего каталога лежат в одной папке на всех клиентов (shared/photos).
// В data.js пути пишутся как 'photos/имя.jpg', а settings.photoBase
// подставляет нужную папку, например '../../shared/photos/'.
(function fixPhotoPaths(){
  var base = SITE_DATA.settings && SITE_DATA.settings.photoBase;
  if (!base) return;
  (function walk(o){
    for (var k in o){
      if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
      var v = o[k];
      if (typeof v === 'string' && v.indexOf('photos/') === 0) o[k] = base + v.slice(7);
      else if (v && typeof v === 'object') walk(v);
    }
  })(SITE_DATA);
})();

// Тексты, которые раньше были вписаны в страницу, теперь из настроек
(function applyTexts(){
  var S = SITE_DATA.settings || {};
  if (S.appTitle) document.title = S.appTitle;
  document.querySelector('.home-head .eyebrow').textContent = S.eyebrow || '';
  document.querySelector('.home-head h1').textContent = S.title || '';
  document.querySelector('.home-head p').textContent = S.intro || '';
  document.getElementById('appFoot').textContent = S.footer || '';
})();

(function(){

  var TG = (window.Telegram && window.Telegram.WebApp) ? window.Telegram.WebApp : null;

  var ICON_CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var complexes = SITE_DATA.complexes;
  var SETTINGS  = SITE_DATA.settings;

  var byId = {};
  complexes.forEach(function(c){ byId[c.id] = c; });

  function fmtRub(n){
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function buildingArt(seed){
    // deterministic abstract skyline from name length, purely decorative
    var h1 = 30 + (seed % 5) * 6, h2 = 46 + (seed % 7) * 4, h3 = 24 + (seed % 3) * 8;
    return '<svg width="100%" height="100%" viewBox="0 0 220 108" preserveAspectRatio="none" style="position:absolute;inset:0;opacity:.5" fill="none">'
      + '<rect x="14" y="'+(108-h1)+'" width="30" height="'+h1+'" fill="currentColor" opacity=".4"/>'
      + '<rect x="52" y="'+(108-h2)+'" width="34" height="'+h2+'" fill="currentColor" opacity=".6"/>'
      + '<rect x="94" y="'+(108-h3-14)+'" width="26" height="'+(h3+14)+'" fill="currentColor" opacity=".3"/>'
      + '<rect x="128" y="'+(108-h2+10)+'" width="30" height="'+(h2-10)+'" fill="currentColor" opacity=".5"/>'
      + '<rect x="166" y="'+(108-h1-8)+'" width="24" height="'+(h1+8)+'" fill="currentColor" opacity=".35"/>'
      + '</svg>';
  }

  // ---------- разделы (Новостройки, Коттеджные посёлки, ...) ----------
  // Список разделов берётся из data.js. Если его там нет — один общий раздел.
  var SECTIONS = (SITE_DATA.sections && SITE_DATA.sections.length)
    ? SITE_DATA.sections
    : [{ id:'all' }];
  var sectionById = {};
  SECTIONS.forEach(function(s){ sectionById[s.id] = s; });
  var currentSection = SECTIONS[0].id;

  // ЖК без поля section попадает в первый раздел
  function sectionOf(c){
    return (c.section && sectionById[c.section]) ? c.section : SECTIONS[0].id;
  }

  var secTabsEl = document.getElementById('secTabs');
  if (SECTIONS.length > 1){
    SECTIONS.forEach(function(s){
      var b = document.createElement('button');
      b.className = 'sec-tab';
      b.type = 'button';
      b.setAttribute('data-sec', s.id);
      b.textContent = s.tab || s.title;
      b.addEventListener('click', function(){ renderHome(s.id); });
      secTabsEl.appendChild(b);
    });
  } else {
    secTabsEl.hidden = true;
  }

  // ---------- render home list ----------
  var listEl = document.getElementById('list');

  function renderHome(sectionId){
    if (!sectionById[sectionId]) sectionId = SECTIONS[0].id;
    currentSection = sectionId;
    var sec = sectionById[sectionId];

    [].forEach.call(secTabsEl.children, function(b){
      var on = b.getAttribute('data-sec') === sectionId;
      b.classList.toggle('active', on);
    });

    // заголовок раздела: из раздела, а если там пусто — из общих настроек
    var eyebrow = document.querySelector('.home-head .eyebrow');
    var h1 = document.querySelector('.home-head h1');
    var intro = document.querySelector('.home-head p');
    eyebrow.textContent = sec.eyebrow || SETTINGS.eyebrow || eyebrow.textContent;
    h1.textContent = sec.title || SETTINGS.title || h1.textContent;

    // если у раздела есть плашки — показываем их вместо заголовка
    var pointsEl = document.getElementById('points');
    var points = sec.points || [];
    h1.hidden = points.length > 0;
    pointsEl.hidden = !points.length;
    pointsEl.innerHTML = '';
    points.forEach(function(t){
      var d = document.createElement('div');
      d.className = 'point';
      d.textContent = t;
      pointsEl.appendChild(d);
    });
    intro.textContent = sec.intro || SETTINGS.intro || intro.textContent;

    listEl.innerHTML = '';
    var items = complexes.filter(function(c){ return sectionOf(c) === sectionId; });

    if (!items.length){
      var empty = document.createElement('div');
      empty.className = 'sec-empty';
      empty.innerHTML = (sec.emptyText || 'Объекты в этом разделе скоро появятся. Напишите — подберу варианты лично.')
        + '<br><button class="btn-primary" type="button">Написать риелтору</button>';
      empty.querySelector('button').addEventListener('click', function(){
        openManagerChat('Здравствуйте! Интересует раздел «' + (sec.tab || sec.title || '') + '».');
      });
      listEl.appendChild(empty);
      return;
    }

    items.forEach(function(c, i){
      var card = document.createElement('button');
      card.className = 'card';
      card.setAttribute('data-id', c.id);
      card.innerHTML =
        ((c.photos && c.photos.length)
          ? '<div class="card-art" style="background-image:linear-gradient(180deg, transparent 40%, rgba(0,0,0,.45) 100%), url(\''+c.photos[0]+'\'); background-size:cover; background-position:center; color:#fff">'
              + '<span class="card-photo-count">'+c.photos.length+' фото</span>'
          : '<div class="card-art" style="--art-bg:'+c.artHue+'; color:var(--accent)">' + buildingArt(c.name.length + i)
        )
          + '<span class="class-badge'+(c.cls==='econom'?' econom':'')+'">'+c.clsLabel+'</span>'
        + '</div>'
        + '<div class="card-body">'
          + '<div class="card-title">'+c.name+'</div>'
          + '<div class="card-addr">'
            + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" stroke-width="2"/></svg>'
            + '<span>'+c.addr+'</span>'
          + '</div>'
          + '<div class="card-foot">'
            + '<div>'
              + '<div class="card-price-label">Цена от</div>'
              + '<div class="card-price">'+(c.priceFrom ? fmtRub(c.priceFrom) : 'уточняется')+'</div>'
            + '</div>'
            + '<div class="card-deadline">'+c.deadlineShort+'</div>'
          + '</div>'
        + '</div>';
      card.addEventListener('click', function(){ openDetail(c.id); });
      listEl.appendChild(card);
    });
  }
  renderHome(currentSection);

  // ---------- detail view ----------
  var viewHome = document.getElementById('view-home');
  var viewDetail = document.getElementById('view-detail');
  var ctaBar = document.getElementById('ctaBar');
  // на кого заявка с закреплённой кнопки внизу: null — текущий ЖК, иначе посёлок или дом
  var ctaTarget = null, villageTarget = null;
  var activeTab = {};

  // ---------- hero photo carousel ----------
  var heroSlides = document.getElementById('dHeroSlides');
  var heroDots = document.getElementById('dHeroDots');
  var heroCounter = document.getElementById('dHeroCounter');

  function heroIndex(){
    if (!heroSlides.clientWidth) return 0;
    return Math.round(heroSlides.scrollLeft / heroSlides.clientWidth);
  }
  function syncHeroUi(){
    var total = heroSlides.children.length;
    if (!total) return;
    var idx = Math.min(Math.max(heroIndex(), 0), total - 1);
    var dots = heroDots.children;
    for (var i = 0; i < dots.length; i++){
      dots[i].className = 'hero-dot' + (i === idx ? ' active' : '');
    }
    heroCounter.textContent = (idx + 1) + '/' + total;
  }
  heroSlides.addEventListener('scroll', function(){
    if (heroSlides._raf) return;
    heroSlides._raf = requestAnimationFrame(function(){
      heroSlides._raf = null;
      syncHeroUi();
    });
  });
  function heroStep(dir){
    var total = heroSlides.children.length;
    if (!total) return;
    var next = Math.min(Math.max(heroIndex() + dir, 0), total - 1);
    heroSlides.scrollTo({ left: next * heroSlides.clientWidth, behavior: 'smooth' });
  }
  document.getElementById('dHeroPrev').addEventListener('click', function(){ heroStep(-1); });
  document.getElementById('dHeroNext').addEventListener('click', function(){ heroStep(1); });

  function renderHeroGallery(c){
    var hero = document.getElementById('dHero');
    var photos = c.photos || [];
    if (photos.length){
      heroSlides.innerHTML = photos.map(function(p){
        return '<div class="hero-slide" style="background-image:url(\''+p+'\')"></div>';
      }).join('');
      heroDots.innerHTML = photos.map(function(_, i){
        return '<span class="hero-dot'+(i === 0 ? ' active' : '')+'"></span>';
      }).join('');
      heroCounter.textContent = '1/' + photos.length;
      hero.classList.add('has-photos');
      // hard reset to the first photo: snapping must be off briefly or the
      // browser restores the previous scroll offset after the DOM swap
      heroSlides.style.scrollSnapType = 'none';
      heroSlides.scrollLeft = 0;
      requestAnimationFrame(function(){
        heroSlides.scrollLeft = 0;
        heroSlides.style.scrollSnapType = '';
        syncHeroUi();
      });
    } else {
      heroSlides.innerHTML = '';
      heroDots.innerHTML = '';
      hero.classList.remove('has-photos');
    }
  }

  function openDetail(id){
    var c = byId[id];
    if (c.type === 'village') return openVillage(c);
    document.getElementById('dTitle').textContent = c.name;
    document.getElementById('dSub').textContent = c.developer;
    document.getElementById('dName').textContent = c.name;
    document.getElementById('dAddr').querySelector('span').textContent = c.addr;
    var badge = document.getElementById('dClassBadge');
    badge.textContent = c.clsLabel;
    badge.className = 'class-badge' + (c.cls==='econom' ? ' econom' : '');
    var heroEl = document.getElementById('dHero');
    heroEl.style.setProperty('--art-bg', c.artHue);
    renderHeroGallery(c);

    if (TG){
      if (TG.BackButton) TG.BackButton.show();
      if (TG.HapticFeedback) { try { TG.HapticFeedback.impactOccurred('light'); } catch(e){} }
    }

    var quick = document.getElementById('dQuick');
    quick.innerHTML = c.quick.map(function(q){
      return '<div class="fact"><div class="v">'+q.v+'</div><div class="l">'+q.l+'</div></div>';
    }).join('');

    // tabs
    var firstAvailable = c.rooms.find(function(r){ return !r.sold; });
    activeTab[id] = activeTab[id] || (firstAvailable ? firstAvailable.key : c.rooms[0].key);
    renderTabs(c);
    renderPriceCard(c);

    var specs = document.getElementById('dSpecs');
    specs.innerHTML = c.specs.map(function(s){
      return '<div class="spec-row"><span class="l">'+s.l+'</span><span class="v">'+s.v+'</span></div>';
    }).join('');

    var cond = document.getElementById('dConditions');
    cond.innerHTML = c.conditions.map(function(x){
      return '<span class="chip">'+ICON_CHECK+x+'</span>';
    }).join('');

    // Карта Яндекса (если в data.js у ЖК есть map)
    renderMap(document.getElementById('dMap'), c.map);

    var dist = document.getElementById('dDistances');
    dist.innerHTML = c.distances.map(function(d){
      return '<div class="dist-row"><span class="place">'+d.place+'</span><span class="time">'+d.time+'</span></div>';
    }).join('');

    var feat = document.getElementById('dFeatures');
    feat.innerHTML = c.features.map(function(f){
      return '<div class="feature"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+f+'</span></div>';
    }).join('');

    ctaBar.dataset.zhk = c.id;
    ctaTarget = null;
    ctaBar.hidden = false;
    viewHome.hidden = true;
    viewDetail.hidden = false;
    viewDetail.scrollTop = 0;
    window.scrollTo(0,0);
  }


  // ---------- страница коттеджного посёлка ----------
  var viewVillage = document.getElementById('view-village');
  var vSlides = document.getElementById('vSlides');
  var PERK_ICONS = {
    gas:'<path d="M12 3c1 3 5 5 5 10a5 5 0 01-10 0c0-2 1-3.5 2-4.5.3 2 1.3 3 2.5 3.5C11 9 11 6 12 3z" fill="currentColor"/>',
    water:'<path d="M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z" fill="currentColor"/>',
    drain:'<path d="M4 6h8a5 5 0 015 5v8h-5v-8H4z" fill="currentColor"/><rect x="11" y="15" width="7" height="2" style="fill:var(--brand2)"/>',
    clean:'<rect x="3" y="9" width="18" height="6" rx="1" fill="currentColor"/><rect x="2" y="7" width="3" height="10" rx="1" fill="currentColor"/><rect x="19" y="7" width="3" height="10" rx="1" fill="currentColor"/>',
    road:'<path d="M9 3h6l5 18H4z" fill="currentColor"/><path d="M12 6v3M12 11v3M12 16v3" style="stroke:var(--brand2)" stroke-width="1.6"/>',
    bus:'<rect x="5" y="3" width="14" height="15" rx="3" fill="currentColor"/><rect x="7" y="6" width="10" height="5" rx="1" style="fill:var(--brand2)"/><circle cx="8.5" cy="14.5" r="1.3" style="fill:var(--brand2)"/><circle cx="15.5" cy="14.5" r="1.3" style="fill:var(--brand2)"/><rect x="6.5" y="18" width="3" height="3" rx="1" fill="currentColor"/><rect x="14.5" y="18" width="3" height="3" rx="1" fill="currentColor"/>',
    city:'<rect x="5" y="3" width="9" height="18" fill="currentColor"/><rect x="14" y="9" width="5" height="12" fill="currentColor"/><path d="M7.5 7h4M7.5 10h4M7.5 13h4M7.5 16h4" style="stroke:var(--brand2)" stroke-width="1.4"/>',
    bio:'<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19c4-5 7-8 11-11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    net:'<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    tv:'<path d="M5 9a8 8 0 008 8L5 9z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 13l4-4M15 3a6 6 0 016 6M15 6a3 3 0 013 3M8 17l-2 4h7l-2-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    shield:'<path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="currentColor"/><path d="M8.5 12l2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    tree:'<path d="M12 2l6 8h-3l4 6H5l4-6H6z" fill="currentColor"/><rect x="11" y="16" width="2" height="6" fill="currentColor"/>',
    ball:'<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z" fill="currentColor"/>',
    power:'<path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="currentColor"/>',
    sea:'<path d="M3 17c2 0 2-1.5 4.5-1.5S9.5 17 12 17s2.5-1.5 4.5-1.5S19 17 21 17v3H3z" fill="currentColor"/><path d="M5 14c0-5 4-9 9-9 2.5 0 4 1.5 4 3.5-2-1-4.5 0-4.5 2.5 0 1.5 1 2.5 2.5 3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>'
  };

  // если длинное слово не влезает в плашку удобства, чуть уменьшаем шрифт только у этой плашки
  function fitPerks(){
    document.querySelectorAll('#vPerks .tx').forEach(function(t){
      var size = 9.5; t.style.fontSize = size + 'px';
      while (t.scrollWidth > t.clientWidth && size > 7.5){ size -= 0.25; t.style.fontSize = size + 'px'; }
    });
  }
  if (document.fonts) document.fonts.ready.then(fitPerks);
  window.addEventListener('resize', fitPerks);

  function esc(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // крупная надпись: подбираем размер шрифта, чтобы самая длинная строка
  // заняла всю ширину плашки
  function fitTagline(){
    var box = document.getElementById('vTagline');
    if (viewVillage.hidden || !box.children.length) return;
    box.style.fontSize = '40px';
    var max = 0;
    [].forEach.call(box.children, function(s){ max = Math.max(max, s.getBoundingClientRect().width); });
    var w = box.clientWidth - 28;
    if (max) box.style.fontSize = Math.min(48, Math.floor(40 * w / max * 0.98)) + 'px';
  }
  window.addEventListener('resize', fitTagline);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTagline);

  function vIndex(){ return Math.round(vSlides.scrollLeft / (vSlides.clientWidth || 1)); }
  function vSync(){
    var total = vSlides.children.length, i = Math.min(vIndex(), total - 1);
    var dots = document.getElementById('vDots').children;
    for (var k = 0; k < dots.length; k++) dots[k].className = 'v-dot' + (k === i ? ' on' : '');
    document.getElementById('vCount').textContent = (i + 1) + '/' + total;
  }
  vSlides.addEventListener('scroll', function(){
    if (vSlides._raf) return;
    vSlides._raf = requestAnimationFrame(function(){ vSlides._raf = null; vSync(); });
  });
  function vStep(d){
    var total = vSlides.children.length;
    var i = Math.min(Math.max(vIndex() + d, 0), total - 1);
    vSlides.scrollTo({ left: i * vSlides.clientWidth, behavior: 'smooth' });
  }
  document.getElementById('vPrev').addEventListener('click', function(){ vStep(-1); });
  document.getElementById('vNext').addEventListener('click', function(){ vStep(1); });
  document.getElementById('vBackBtn').addEventListener('click', goHome);

  function openVillage(c){
    var short = c.logo || c.name;
    function lead(what){ return { name: 'посёлок ' + short + ', ' + what, room: '' }; }

    document.getElementById('vTitle').textContent = c.name;
    document.getElementById('vSub').textContent = 'Коттеджный посёлок';
    document.getElementById('vLogo').innerHTML = c.hideLogo ? '' : c.logoImg ? '<img src="' + c.logoImg + '" alt="' + esc(c.logo || c.name) + '"' + (c.logoWidth ? ' style="max-width:' + c.logoWidth + 'px"' : '') + '>' : '<b>' + esc(c.logo || c.name) + '</b>' + (c.logoSub ? '<small>' + esc(c.logoSub) + '</small>' : '');
    document.getElementById('vAddr').textContent = c.addr || '';

    var photos = c.photos || [];
    vSlides.innerHTML = photos.map(function(p){ return '<div class="v-slide" style="background-image:url(\'' + p + '\')"></div>'; }).join('');
    document.getElementById('vDots').innerHTML = photos.map(function(_, i){ return '<span class="v-dot' + (i ? '' : ' on') + '"></span>'; }).join('');
    document.getElementById('vCount').textContent = photos.length ? '1/' + photos.length : '';
    vSlides.scrollLeft = 0;

    var headline = document.getElementById('vHeadline');
    headline.textContent = c.headline || '';
    headline.hidden = !c.headline;

    document.getElementById('vPerks').innerHTML = (c.perks || []).map(function(p){
      return '<div class="v-perk' + (p.wide ? ' wide' : '') + '">'
        + '<div class="ic"><svg width="17" height="17" viewBox="0 0 24 24">' + (PERK_ICONS[p.icon] || PERK_ICONS.city) + '</svg></div>'
        + '<div class="tx">' + esc(p.text) + '</div></div>';
    }).join('');
    fitPerks(); requestAnimationFrame(fitPerks);

    var tag = document.getElementById('vTagline');
    tag.innerHTML = (c.tagline || []).map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('');
    tag.hidden = !(c.tagline && c.tagline.length);

    var list = document.getElementById('vHouses');
    list.innerHTML = '';
    // houseCards:false в data.js — карточки домов не показываем (остаются кнопки домов)
    list.hidden = c.houseCards === false;
    var cards = [];
    (c.houses || []).forEach(function(h){
      var plan0 = housePlans(h)[0];
      var el = document.createElement('div');
      el.className = 'v-house';
      el.innerHTML = '<div class="v-house-photo" style="background-image:url(\'' + h.photo + '\')"></div>'
        + '<h3>' + esc(h.name) + '</h3>'
        + '<div class="facts">Общая площадь ' + esc(h.area) + ' кв.м.' + (h.bedrooms ? '<br>Спальни ' + esc(h.bedrooms) : '') + (h.plot ? '<br>Участок ' + esc(h.plot) + ' соток' : '') + '</div>'
        + (h.price ? '<div class="price">' + esc(h.price) + '</div>' : '')
        + (h.note ? '<div class="note">' + esc(h.note) + '</div>' : '')
        + (plan0 ? '<button class="v-plan" type="button" aria-label="Увеличить планировку"><img src="' + esc(plan0) + '" alt="Планировка дома ' + esc(h.name) + '" loading="lazy"></button>'
          + '<div class="v-plan-hint">Планировка. Нажмите, чтобы увеличить</div>' : '')
        + (hasPage(h) ? '<button class="v-more" type="button">Подробнее о доме →</button>' : '')
        + '<button class="v-btn" type="button">Оставить заявку →</button>';
      el.querySelector('.v-btn').addEventListener('click', function(){ openLeadForm(lead('дом ' + h.name)); });
      var pl = el.querySelector('.v-plan');
      if (pl) pl.addEventListener('click', function(){ openHousePlan(plan0); });
      var more = el.querySelector('.v-more');
      if (more) more.addEventListener('click', function(){ openHouse(c, h); });
      list.appendChild(el);
      cards.push(el);
    });
    if (c.customProject){
      var cp = document.createElement('div');
      cp.className = 'v-house';
      cp.innerHTML = '<div class="v-house-photo brandbox"><div class="logo">' + esc(c.logo || c.name) + (c.logoSub ? '<small>' + esc(c.logoSub) + '</small>' : '') + '</div></div>'
        + '<h3>' + esc(c.customProject.title) + '</h3>'
        + '<div class="facts">' + esc(c.customProject.text) + '</div>'
        + '<button class="v-btn" type="button">Оставить заявку →</button>';
      cp.querySelector('button').addEventListener('click', function(){ openLeadForm(lead('индивидуальный проект')); });
      list.appendChild(cp);
    }

    // Кнопки с названиями домов под крупной фразой (houseButtons:true в data.js).
    // Дом со страницей открывает её, остальное листает к своей карточке ниже.
    var hb = document.getElementById('vHouseBtns');
    hb.innerHTML = '';
    hb.hidden = !c.houseButtons;
    if (c.houseButtons){
      (c.houses || []).forEach(function(h, i){
        var b = document.createElement('button');
        // последняя кнопка без пары (и без «Индивидуального проекта») — на всю ширину
        var alone = !c.customProject && i === c.houses.length - 1 && i % 2 === 0;
        b.type = 'button'; b.className = 'v-hbtn' + (alone ? ' wide' : '');
        b.innerHTML = '<span>' + esc(h.name) + (h.area ? '<small>' + esc(h.area) + ' м²</small>' : '') + '</span>';
        b.addEventListener('click', function(){
          if (hasPage(h)) openHouse(c, h);
          else if (list.hidden) openLeadForm(lead('дом ' + h.name));
          else cards[i].scrollIntoView({ behavior:'smooth', block:'start' });
        });
        hb.appendChild(b);
      });
      if (c.customProject){
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'v-hbtn' + ((c.houses || []).length % 2 ? '' : ' wide') + (c.customProject.title.length > 12 ? ' long' : '');
        b.textContent = c.customProject.title;
        b.addEventListener('click', function(){
          if (list.hidden) openLeadForm(lead('индивидуальный проект'));
          else cp.scrollIntoView({ behavior:'smooth', block:'start' });
        });
        hb.appendChild(b);
      }
    }

    // Карта посёлка (если в data.js у посёлка есть map)
    renderMap(document.getElementById('vMap'), c.map);
    document.getElementById('vMapSection').hidden = !(c.map && c.map.points && c.map.points.length);

    document.getElementById('vCondLead').textContent = c.conditionsLead || '';
    document.getElementById('vCondTitle').textContent = c.conditionsTitle || 'Условия покупки';
    document.getElementById('vConds').innerHTML = (c.conditions || []).map(function(x){
      return '<div class="v-cond' + (x.wide ? ' wide' : '') + '"><div class="t">' + esc(x.title) + '</div>'
        + (x.rate ? '<div class="r">' + esc(x.rate) + '</div>' : '')
        + (x.text ? '<div class="d">' + esc(x.text) + '</div>' : '') + '</div>';
    }).join('');
    var consult = document.getElementById('vConsult');
    consult.textContent = (c.consultText || 'Получить консультацию') + ' →';
    consult.onclick = function(){ openLeadForm(lead('консультация по покупке')); };

    if (TG){
      if (TG.BackButton) TG.BackButton.show();
      if (TG.HapticFeedback) { try { TG.HapticFeedback.impactOccurred('light'); } catch(e){} }
    }
    villageTarget = ctaTarget = { name: 'посёлок ' + short, room: '' };
    ctaBar.hidden = false;
    viewHome.hidden = true;
    viewDetail.hidden = true;
    viewHouse.hidden = true;
    viewVillage.hidden = false;
    window.scrollTo(0, 0);
    fitTagline();
  }

  // ---------- страница дома в посёлке ----------
  var viewHouse = document.getElementById('view-house');
  var hSlides = document.getElementById('hSlides');
  var villageScroll = 0;

  // plans — список вариантов; старое поле plan тоже понимаем
  function housePlans(h){ return h.plans || (h.plan ? [h.plan] : []); }
  // своя страница есть, если у дома есть фото, помещения или планировки
  function hasPage(h){ return !!((h.photos && h.photos.length) || (h.rooms && h.rooms.length) || housePlans(h).length > 1); }

  function hIndex(){ return Math.round(hSlides.scrollLeft / (hSlides.clientWidth || 1)); }
  hSlides.addEventListener('scroll', function(){
    var n = hSlides.children.length;
    document.getElementById('hCount').textContent = n ? (hIndex() + 1) + '/' + n : '';
  });
  function hStep(d){
    var i = Math.min(Math.max(hIndex() + d, 0), hSlides.children.length - 1);
    hSlides.scrollTo({ left: i * hSlides.clientWidth, behavior: 'smooth' });
  }
  document.getElementById('hPrev').addEventListener('click', function(){ hStep(-1); });
  document.getElementById('hNext').addEventListener('click', function(){ hStep(1); });
  document.getElementById('hBackBtn').addEventListener('click', backToVillage);

  function openHouse(c, h){
    var short = c.logo || c.name;
    villageScroll = window.scrollY;
    // «Тип 2» → «Дом «Тип 2»», а «Дом 100» и «Дуплекс 72» оставляем как есть
    var full = /^(Дом|Дуплекс|Квадрохаус)/.test(h.name) ? h.name : 'Дом «' + h.name + '»';
    document.getElementById('hTopTitle').textContent = full;
    document.getElementById('hTopSub').textContent = c.name;

    var photos = (h.photos && h.photos.length) ? h.photos : [h.photo];
    hSlides.innerHTML = photos.map(function(p){ return '<div class="v-slide" style="background-image:url(\'' + p + '\')"></div>'; }).join('');
    hSlides.scrollLeft = 0;
    document.getElementById('hCount').textContent = '1/' + photos.length;
    document.getElementById('hPrev').hidden = document.getElementById('hNext').hidden = photos.length < 2;

    document.getElementById('hTitle').textContent = h.name;
    document.getElementById('hPrice').textContent = h.price || '';
    var note = document.getElementById('hNote');
    note.textContent = h.note || '';
    note.hidden = !h.note;
    document.getElementById('hFacts').innerHTML = [
      h.area ? h.area + ' м²' : '', h.bedrooms ? 'спальни: ' + h.bedrooms : '', h.plot ? 'участок ' + h.plot + ' сот.' : ''
    ].filter(Boolean).map(function(s){ return '<span>' + esc(s) + '</span>'; }).join('');

    var rooms = h.rooms || [];
    document.getElementById('hRoomsBox').hidden = !rooms.length;
    document.getElementById('hRooms').innerHTML = rooms.map(function(r){
      return '<div class="spec-row"><span class="l">' + esc(r.l) + '</span><span class="v">' + esc(r.v) + ' м²</span></div>';
    }).join('');

    var plans = housePlans(h), planBtn = document.getElementById('hPlan'), tabs = document.getElementById('hPlanTabs');
    document.getElementById('hPlanBox').hidden = !plans.length;
    function showPlan(i){
      planBtn.querySelector('img').src = plans[i];
      planBtn.onclick = function(){ openHousePlan(plans[i]); };
      [].forEach.call(tabs.children, function(t, j){ t.classList.toggle('on', j === i); });
    }
    tabs.innerHTML = plans.length > 1 ? plans.map(function(_, i){ return '<button type="button" class="h-tab">' + esc((h.planNames && h.planNames[i]) || 'Вариант ' + (i + 1)) + '</button>'; }).join('') : '';
    [].forEach.call(tabs.children, function(t, i){ t.addEventListener('click', function(){ showPlan(i); }); });
    if (plans.length) showPlan(0);

    // описание постройки общее для всех домов посёлка (houseSpecs в data.js)
    var specs = c.houseSpecs || [];
    document.getElementById('hSpecsBox').hidden = !specs.length;
    document.getElementById('hSpecs').innerHTML = specs.map(function(s){
      return '<details class="h-spec"><summary>' + esc(s.title) + '</summary><ul>'
        + s.items.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>';
    }).join('');

    ctaTarget = { name: 'посёлок ' + short + ', ' + full.charAt(0).toLowerCase() + full.slice(1), room: '' };

    viewVillage.hidden = true;
    viewHouse.hidden = false;
    window.scrollTo(0, 0);
  }

  function backToVillage(){
    viewHouse.hidden = true;
    viewVillage.hidden = false;
    ctaTarget = villageTarget;
    window.scrollTo(0, villageScroll);
  }
  // кнопка «Назад» Telegram: со страницы дома — в посёлок, иначе — на главную
  function goBack(){ if (!viewHouse.hidden) backToVillage(); else goHome(); }

  // Карта Яндекса: блок с картой + кнопка «Открыть в Яндекс Картах».
  // m = {z, points:[{lat,lon}]} из data.js. Метки виджет показывает без номеров.
  function renderMap(mapEl, m){
    mapEl.innerHTML = '';
    if (m && m.points && m.points.length){
      var pts = m.points, lat = 0, lon = 0;
      pts.forEach(function(p){ lat += p.lat; lon += p.lon; });
      lat = (lat/pts.length).toFixed(6); lon = (lon/pts.length).toFixed(6);
      var z = m.z || 16;
      var pt = pts.map(function(p){ return p.lon+','+p.lat; }).join('~');
      var q = 'll='+lon+','+lat+'&z='+z+'&pt='+pt;
      var openUrl = 'https://yandex.ru/maps/?'+q;
      mapEl.innerHTML = '<div class="map-box"><iframe src="https://yandex.ru/map-widget/v1/?'+q+'" loading="lazy" allowfullscreen title="Карта"></iframe></div>'
        + '<button type="button" class="map-open"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>Открыть в Яндекс Картах</button>';
      mapEl.querySelector('.map-open').onclick = function(){
        if (TG && TG.openLink) TG.openLink(openUrl); else window.open(openUrl, '_blank');
      };
    }
  }

  function renderTabs(c){
    var tabs = document.getElementById('dTabs');
    tabs.innerHTML = '';
    c.rooms.forEach(function(r){
      var btn = document.createElement('button');
      btn.className = 'tab';
      btn.type = 'button';
      btn.textContent = r.label;
      btn.setAttribute('role','tab');
      btn.setAttribute('aria-selected', String(activeTab[c.id] === r.key));
      if (r.sold) btn.disabled = true;
      btn.addEventListener('click', function(){
        activeTab[c.id] = r.key;
        renderTabs(c);
        renderPriceCard(c);
      });
      tabs.appendChild(btn);
    });
  }

  function renderPriceCard(c){
    var card = document.getElementById('dPriceCard');
    var r = c.rooms.find(function(x){ return x.key === activeTab[c.id]; });
    if (r.sold){
      card.innerHTML = '<div class="price-sold">В этой категории квартиры уже проданы</div>';
      return;
    }
    card.innerHTML =
      '<div class="price-row"><span class="l">Площадь</span><span class="v">'+r.area+'</span></div>'
      + '<div class="price-row"><span class="l">Цена за м²</span><span class="v">'+r.pricePerM2+'</span></div>'
      + '<div class="price-row total"><span class="l">Цена за квартиру</span><span class="v">'+r.priceTotal+'</span></div>'
      + '<div style="font-size:11.5px;color:var(--fg-muted);padding-top:2px">Цены '+c.pricesAsOf+'</div>'
      + planHtml(r.plan);
    var pi = card.querySelector('.plan-img');
    if (pi) pi.addEventListener('click', function(){ openPlanZoom(r.plan.img); });
  }

  // пример планировки: картинка + площадь, этаж, корпус, цена этой квартиры
  function planHtml(p){
    if (!p) return '';
    return '<div class="plan">'
      + '<div class="plan-title">Пример планировки</div>'
      + '<button type="button" class="plan-img" aria-label="Увеличить планировку"><img src="'+esc(p.img)+'" alt="Планировка" loading="lazy"></button>'
      + '<div class="plan-hint">Нажмите на план, чтобы увеличить</div>'
      + '<div class="plan-facts">'
        + '<span>'+esc(p.area)+' м²</span>'
        + (p.floor ? '<span>'+esc(p.floor)+' этаж</span>' : '')
        + (p.building ? '<span>корп. '+esc(p.building)+'</span>' : '')
        + (p.deadline ? '<span>'+(/сдан/i.test(p.deadline) ? 'дом сдан' : 'сдача '+esc(p.deadline))+'</span>' : '')
      + '</div>'
      + (p.price ? '<div class="price-row total"><span class="l">Цена этой квартиры</span><span class="v">'+esc(p.price)+'</span></div>' : '')
      + '</div>';
  }

  var planZoom = document.createElement('div');
  planZoom.className = 'plan-zoom'; planZoom.hidden = true;
  planZoom.innerHTML = '<img alt="Планировка">';
  planZoom.addEventListener('click', function(){ planZoom.hidden = true; });
  document.body.appendChild(planZoom);
  function openPlanZoom(src){
    planZoom.querySelector('img').src = src;
    planZoom.hidden = false;
  }

  // планировка дома на весь экран; закрывается нажатием в любом месте
  var housePlanZoom = document.createElement('div');
  housePlanZoom.className = 'v-plan-zoom'; housePlanZoom.hidden = true;
  housePlanZoom.innerHTML = '<img alt="Планировка">';
  housePlanZoom.addEventListener('click', function(){ housePlanZoom.hidden = true; });
  document.body.appendChild(housePlanZoom);
  function openHousePlan(src){
    housePlanZoom.querySelector('img').src = src;
    housePlanZoom.hidden = false;
  }

  function goHome(){
    viewDetail.hidden = true;
    viewVillage.hidden = true;
    viewHouse.hidden = true;
    viewHome.hidden = false;
    ctaBar.hidden = true;
    window.scrollTo(0,0);
    if (TG && TG.BackButton) TG.BackButton.hide();
  }
  document.getElementById('backBtn').addEventListener('click', goHome);

  // ---------- lead modal ----------
  var backdrop = document.getElementById('modalBackdrop');
  var modalBody = document.getElementById('modalBody');

  var MANAGER = (SITE_DATA.settings && SITE_DATA.settings.manager) || '';

  function roomLabel(c){
    var key = activeTab[c.id];
    var r = c.rooms.filter(function(x){ return x.key === key; })[0];
    if (!r) return '';
    // если у комнатности есть пример планировки — риелтор увидит, какая именно квартира
    if (r.plan) return r.label + ' ' + r.plan.area + ' м²' + (r.plan.floor ? ', ' + r.plan.floor + ' этаж' : '')
      + (r.plan.building ? ', корп. ' + r.plan.building : '') + (r.plan.flat ? ', кв. ' + r.plan.flat : '');
    return r.label;
  }

  // собирает текст заявки, который клиент отправит одним нажатием
  // target — что выбрал клиент: {name:'ЖК «…»', room:'2-комн.'}
  function leadText(target, name, phone){
    var t = 'Здравствуйте! Интересует ' + target.name;
    var room = target.room;
    if (room) t += ', ' + room.toLowerCase().replace(/\.$/, '');
    t += '.';
    if (name)  t += '\nМеня зовут ' + name + '.';
    if (phone) t += '\nТелефон: ' + phone;
    t += '\nСогласен на обработку персональных данных.';
    return t;
  }

  function openManagerChat(text){
    var url = 'https://t.me/' + MANAGER + '?text=' + encodeURIComponent(text);
    if (TG && TG.openTelegramLink) TG.openTelegramLink(url);
    else window.open(url, '_blank');
  }

  // политика конфиденциальности — privacy.html в папке клиента рядом с data.js;
  // Telegram открывает её поверх приложения, введённые данные в форме не пропадают
  function openPolicy(){
    var url = new URL('privacy.html', location.href).href;
    if (TG && TG.openLink) TG.openLink(url);
    else window.open(url, '_blank');
  }

  // окно услуги: описание, пункты, цена и кнопка заявки
  function openService(it){
    modalBody.innerHTML = '<div class="svc-sheet">'
      + '<h3>' + esc((it.icon ? it.icon + ' ' : '') + (it.title || '')) + '</h3>'
      + (it.text ? '<p>' + esc(it.text) + '</p>' : '')
      + ((it.list && it.list.length) ? '<ul>' + it.list.map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '')
      + (it.price ? '<div class="price">' + esc(it.price) + '</div>' : '')
      + '<div class="modal-actions">'
        + '<button class="btn-ghost" id="svcClose" type="button">Закрыть</button>'
        + '<button class="btn-primary" id="svcLead" type="button">' + esc(it.button || 'Оставить заявку') + '</button>'
      + '</div></div>';
    backdrop.hidden = false;
    document.getElementById('svcClose').addEventListener('click', closeModal);
    document.getElementById('svcLead').addEventListener('click', function(){
      openLeadForm({ name: it.lead || ('услугу «' + (it.title || '') + '»'), room: '' });
    });
  }

  function openLeadForm(target){
    if (!target){
      var zhk = byId[ctaBar.dataset.zhk];
      target = { name: zhk.name, room: roomLabel(zhk) };
    }
    var c = target;
    modalBody.innerHTML =
      '<h3>Заявка на '+c.name+'</h3>'
      + '<p>Заполните, и откроется чат с риелтором — текст уже будет набран, останется отправить.</p>'
      + '<div class="field"><label for="leadName">Имя</label><input id="leadName" type="text" placeholder="Как к вам обращаться" autocomplete="name"></div>'
      + '<div class="field"><label for="leadPhone">Телефон</label>'
        + '<div class="phone-wrap"><span class="phone-prefix">+7</span>'
        + '<input id="leadPhone" type="tel" inputmode="numeric" maxlength="15" placeholder="924 123-45-67" autocomplete="tel"></div></div>'
      // без галочки заявку отправить нельзя: так требует закон о персональных данных
      + '<label class="consent"><input id="leadConsent" type="checkbox">'
        + '<span>Согласен на обработку персональных данных и принимаю <a href="#" id="leadPolicy">политику конфиденциальности</a></span></label>'
      + '<div class="modal-actions">'
        + '<button class="btn-ghost" id="leadCancel" type="button">Отмена</button>'
        + '<button class="btn-primary" id="leadSubmit" type="button" disabled>Написать риелтору</button>'
      + '</div>';
    backdrop.hidden = false;

    // клиент вводит только цифры после +7, формат подставляется сам
    var phoneEl = document.getElementById('leadPhone');
    phoneEl.addEventListener('input', function(){
      var dgt = phoneEl.value.replace(/\D/g, '').slice(0, 10);
      var out = dgt.slice(0, 3);
      if (dgt.length > 3) out += ' ' + dgt.slice(3, 6);
      if (dgt.length > 6) out += '-' + dgt.slice(6, 8);
      if (dgt.length > 8) out += '-' + dgt.slice(8, 10);
      phoneEl.value = out;
    });

    document.getElementById('leadCancel').addEventListener('click', closeModal);
    var consentEl = document.getElementById('leadConsent');
    consentEl.addEventListener('change', function(){
      document.getElementById('leadSubmit').disabled = !consentEl.checked;
    });
    document.getElementById('leadPolicy').addEventListener('click', function(e){
      e.preventDefault();
      openPolicy();
    });

    document.getElementById('leadSubmit').addEventListener('click', function(){
      if (!consentEl.checked) return;
      var name  = document.getElementById('leadName').value.trim();
      var digits = document.getElementById('leadPhone').value.replace(/\D/g, '');
      var phone = digits ? '+7 ' + document.getElementById('leadPhone').value.trim() : '';
      if (TG && TG.HapticFeedback) { try { TG.HapticFeedback.notificationOccurred('success'); } catch(e){} }

      var endpoint = SETTINGS && SETTINGS.leadEndpoint;
      var initData = TG && TG.initData;
      if (!endpoint || !initData){
        openManagerChat(leadText(c, name, phone));
        showThanks(c);
        return;
      }

      // заявка уходит боту автоматически; если не вышло — старый способ через чат
      var btn = document.getElementById('leadSubmit');
      btn.disabled = true;
      btn.textContent = 'Отправляем…';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: initData, complex: c.name, room: c.room || '', name: name, phone: phone, consent: true })
      }).then(function(r){
        if (!r.ok) throw new Error('http ' + r.status);
        showSent(c);
      }).catch(function(){
        openManagerChat(leadText(c, name, phone));
        showThanks(c);
      });
    });
  }

  function showSent(c){
    modalBody.innerHTML =
      '<div class="ok-state">'
        + '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        + '<h3>Заявка отправлена</h3>'
        + '<p>Риелтор получил заявку по «'+c.name+'» и скоро свяжется с вами.</p>'
        + '<button class="btn-primary" type="button" id="leadClose" style="margin-top:6px;width:100%;padding:12px;border-radius:11px;font-weight:700;cursor:pointer;font-family:inherit;border:1px solid var(--accent)">Готово</button>'
      + '</div>';
    document.getElementById('leadClose').addEventListener('click', closeModal);
  }

  function showThanks(c){
    modalBody.innerHTML =
      '<div class="ok-state">'
        + '<svg width="40" height="40" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M8 12.5l2.5 2.5L16 9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        + '<h3>Почти готово</h3>'
        + '<p>Открылся чат с риелтором, текст про «'+c.name+'» уже набран — просто нажмите «Отправить».</p>'
        + '<button class="btn-primary" type="button" id="leadClose" style="margin-top:6px;width:100%;padding:12px;border-radius:11px;font-weight:700;cursor:pointer;font-family:inherit;border:1px solid var(--accent)">Готово</button>'
      + '</div>';
    document.getElementById('leadClose').addEventListener('click', closeModal);
  }

  function closeModal(){ backdrop.hidden = true; }
  backdrop.addEventListener('click', function(e){ if (e.target === backdrop) closeModal(); });

  document.getElementById('ctaBtn').addEventListener('click', function(){ openLeadForm(ctaTarget || undefined); });


  // ---------- применяем настройки из data.js ----------
  (function applySettings(){
    if (!SETTINGS) return;
    var root = document.documentElement;
    if (SETTINGS.accent){
      root.style.setProperty('--accent', SETTINGS.accent);
      root.style.setProperty('--accent-soft', SETTINGS.accent + '22');
    }
    if (SETTINGS.accentDark && window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches){
      root.style.setProperty('--accent', SETTINGS.accentDark);
      root.style.setProperty('--accent-soft', SETTINGS.accentDark + '22');
    }
    // Своя палитра клиента (settings.theme). light:true — всегда светлая
    // тема, даже если в Telegram включена тёмная.
    var T = SETTINGS.theme;
    if (T){
      if (T.light) root.setAttribute('data-theme', 'light');
      var vars = { bg:'--bg', card:'--bg-elevated', text:'--fg', muted:'--fg-muted', border:'--border',
        accent:'--accent', accentInk:'--accent-ink', soft:'--accent-soft', cta:'--cta', ctaInk:'--cta-ink', brand2:'--brand2' };
      for (var k in vars) if (T[k]) root.style.setProperty(vars[k], T[k]);
    }
    var cta = document.getElementById('ctaBtn');
    if (SETTINGS.ctaText && cta) cta.textContent = SETTINGS.ctaText;

    // Карточка риелтора на главной: фото, имя, кнопка «Написать».
    // Нет фото — в кружке первая буква имени.
    var A = SETTINGS.agent, agentEl = document.getElementById('agent');
    if (A && agentEl){
      agentEl.innerHTML = (A.photo ? '<img src="' + esc(A.photo) + '" alt="">'
          : '<div class="ini">' + esc((A.name || '?').charAt(0)) + '</div>')
        + '<div class="who"><div class="nm">' + esc(A.name || '') + '</div>'
        + (A.role ? '<div class="rl">' + esc(A.role) + '</div>' : '') + '</div>'
        + '<button type="button">' + esc(A.button || 'Написать') + '</button>';
      agentEl.querySelector('button').addEventListener('click', function(){
        openManagerChat('Здравствуйте! Хочу подобрать недвижимость.');
      });
      agentEl.hidden = false;
    }
    // Блок «Наши услуги» под карточкой риелтора. Нажатие — окно услуги,
    // из него форма заявки с названием услуги.
    // золотая рамка у плашек-преимуществ (settings.goldPoints в data.js)
    if (SETTINGS.goldPoints) document.getElementById('points').classList.add('gold');

    var S = SETTINGS.services, svcEl = document.getElementById('services');
    if (S && S.items && S.items.length && svcEl){
      svcEl.innerHTML = (S.title ? '<div class="svc-h">' + esc(S.title) + '</div>' : '')
        + '<div class="svc-list"></div>';
      var svcList = svcEl.querySelector('.svc-list');
      S.items.forEach(function(it){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'svc-row';
        b.innerHTML = '<div class="ic">' + esc(it.icon || '') + '</div>'
          + '<div class="tx"><div class="ti">' + esc(it.title || '') + '</div>'
          + (it.short ? '<div class="sb">' + esc(it.short) + '</div>' : '') + '</div>'
          + '<div class="ar">›</div>';
        b.addEventListener('click', function(){ openService(it); });
        svcList.appendChild(b);
      });
      svcEl.hidden = false;
    }
  })();

  // ---------- Telegram Mini App integration ----------
  if (TG){
    TG.ready();
    TG.expand();                                   // открыть на всю высоту экрана
    if (TG.disableVerticalSwipes) { try { TG.disableVerticalSwipes(); } catch(e){} }
    if (TG.setHeaderColor)     { try { TG.setHeaderColor((SETTINGS.theme && SETTINGS.theme.accent) || SETTINGS.accent || '#0E6E64'); } catch(e){} }
    if (TG.setBackgroundColor) { try { TG.setBackgroundColor((SETTINGS.theme && SETTINGS.theme.bg) || '#F3F1EC'); } catch(e){} }

    if (TG.BackButton){
      TG.BackButton.onClick(goBack);
      TG.BackButton.hide();
    }

    // прямые ссылки: t.me/<bot>/<app>?startapp=moygorod → сразу карточка ЖК
    var start = (TG.initDataUnsafe && TG.initDataUnsafe.start_param) || '';
    if (!start){
      var m = location.search.match(/[?&]startapp=([A-Za-z0-9_-]+)/);
      if (m) start = m[1];
    }
    openStart(start);
  } else {
    // тот же параметр работает и в обычном браузере — удобно для проверки
    var m2 = location.search.match(/[?&]startapp=([A-Za-z0-9_-]+)/);
    openStart(m2 ? m2[1] : '');
  }

  // Что открыть при запуске. Кнопки бота открывают адрес вида
  //   .../?section=cottages        → сразу раздел «Коттеджные посёлки»
  // а startapp может быть и id раздела, и id ЖК.
  function openStart(start){
    var ms = location.search.match(/[?&]section=([A-Za-z0-9_-]+)/);
    if (ms && sectionById[ms[1]]) renderHome(ms[1]);
    if (start && sectionById[start]) renderHome(start);
    else if (start && byId[start]){
      renderHome(sectionOf(byId[start]));
      openDetail(start);
    }
  }

})();
