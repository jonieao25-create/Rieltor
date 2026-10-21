/* ============================================================================
   ДВИЖОК мини-приложения для риелторов. Общий для всех клиентов.
   Данные клиента (тексты, цвета, объекты) лежат в clients/<id>/data.js,
   здесь их нет. Правки в этом файле сразу получают все клиенты.
   ============================================================================ */
(function(){

  // разметка страницы общая для всех клиентов, тексты подставляются из data.js
  var MARKUP = [
    '<div class="app">',
    '',
    '  <!-- ===== HOME ===== -->',
    '  <section id="view-home">',
    '    <div class="home-head">',
    '      <div class="eyebrow"></div>',
    '      <h1></h1>',
    '      <p></p>',
    '    </div>',
    '    <div class="list" id="list"></div>',
    '  </section>',
    '',
    '  <!-- ===== DETAIL ===== -->',
    '  <section id="view-detail" hidden>',
    '    <div class="topbar">',
    '      <button class="back-btn" id="backBtn" aria-label="Назад">',
    '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '      </button>',
    '      <div>',
    '        <div class="topbar-title" id="dTitle">—</div>',
    '        <div class="topbar-sub" id="dSub">—</div>',
    '      </div>',
    '    </div>',
    '',
    '    <div class="hero" id="dHero">',
    '      <div class="hero-slides" id="dHeroSlides"></div>',
    '      <div class="hero-shade"></div>',
    '      <svg class="deco" width="64" height="64" viewBox="0 0 64 64" fill="none"><rect x="10" y="20" width="12" height="34" fill="currentColor" opacity=".35"/><rect x="26" y="8" width="14" height="46" fill="currentColor" opacity=".55"/><rect x="44" y="26" width="10" height="28" fill="currentColor" opacity=".3"/></svg>',
    '      <button class="hero-arrow prev" id="dHeroPrev" aria-label="Предыдущее фото">',
    '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '      </button>',
    '      <button class="hero-arrow next" id="dHeroNext" aria-label="Следующее фото">',
    '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    '      </button>',
    '      <div class="hero-counter" id="dHeroCounter">1/4</div>',
    '      <div class="hero-content">',
    '        <span class="class-badge" id="dClassBadge">—</span>',
    '        <h2 id="dName">—</h2>',
    '        <div class="hero-bottom">',
    '          <div class="addr" id="dAddr">',
    '            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-7.2 7-12a7 7 0 10-14 0c0 4.8 7 12 7 12z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.4" stroke="currentColor" stroke-width="2"/></svg>',
    '            <span>—</span>',
    '          </div>',
    '          <div class="hero-dots" id="dHeroDots"></div>',
    '        </div>',
    '      </div>',
    '    </div>',
    '',
    '    <div class="section">',
    '      <div class="quickfacts" id="dQuick"></div>',
    '    </div>',
    '',
    '    <div class="section">',
    '      <div class="section-title">Цены на квартиры</div>',
    '      <div class="tabs" id="dTabs" role="tablist"></div>',
    '      <div class="price-card" id="dPriceCard"></div>',
    '    </div>',
    '',
    '    <div class="section">',
    '      <div class="section-title">Характеристики дома</div>',
    '      <div class="specs" id="dSpecs"></div>',
    '    </div>',
    '',
    '    <div class="section">',
    '      <div class="section-title">Условия покупки</div>',
    '      <div class="chips" id="dConditions"></div>',
    '    </div>',
    '',
    '    <div class="section" id="dDistSection">',
    '      <div class="section-title">Расположение</div>',
    '      <div class="distances" id="dDistances"></div>',
    '    </div>',
    '',
    '    <div class="section">',
    '      <div class="section-title">Особенности</div>',
    '      <div class="features" id="dFeatures"></div>',
    '    </div>',
    '',
    '    <div class="cta-space"></div>',
    '  </section>',
    '',
    '  <footer class="app-foot" id="appFoot"></footer>',
    '</div>',
    '',
    '<div class="cta-bar" id="ctaBar" hidden>',
    '  <div class="cta-inner">',
    '    <button class="cta-btn" id="ctaBtn">Оставить заявку</button>',
    '  </div>',
    '</div>',
    '',
    '<div class="modal-backdrop" id="modalBackdrop" hidden>',
    '  <div class="modal" id="modalBody"></div>',
    '</div>'
  ].join('\n');
  document.body.insertAdjacentHTML('afterbegin', MARKUP);

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

  // ---------- render home list ----------
  var listEl = document.getElementById('list');
  complexes.forEach(function(c, i){
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

  // ---------- detail view ----------
  var viewHome = document.getElementById('view-home');
  var viewDetail = document.getElementById('view-detail');
  var ctaBar = document.getElementById('ctaBar');
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
    document.getElementById('dTitle').textContent = c.name;
    document.getElementById('dSub').textContent = c.developer || c.addr;
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

    var dist = document.getElementById('dDistances');
    dist.innerHTML = c.distances.map(function(d){
      return '<div class="dist-row"><span class="place">'+d.place+'</span><span class="time">'+d.time+'</span></div>';
    }).join('');

    var feat = document.getElementById('dFeatures');
    feat.innerHTML = c.features.map(function(f){
      return '<div class="feature"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span>'+f+'</span></div>';
    }).join('');

    ctaBar.dataset.zhk = c.id;
    ctaBar.hidden = false;
    viewHome.hidden = true;
    viewDetail.hidden = false;
    viewDetail.scrollTop = 0;
    window.scrollTo(0,0);
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
      + '<div style="font-size:11.5px;color:var(--fg-muted);padding-top:2px">Цены '+c.pricesAsOf+'</div>';
  }

  function goHome(){
    viewDetail.hidden = true;
    viewHome.hidden = false;
    ctaBar.hidden = true;
    window.scrollTo(0,0);
    if (TG && TG.BackButton) TG.BackButton.hide();
  }
  document.getElementById('backBtn').addEventListener('click', goHome);

  // ---------- lead modal ----------
  var backdrop = document.getElementById('modalBackdrop');
  var modalBody = document.getElementById('modalBody');

  var MANAGER = SETTINGS.manager;

  function roomLabel(c){
    var key = activeTab[c.id];
    var r = c.rooms.filter(function(x){ return x.key === key; })[0];
    return r ? r.label : '';
  }

  // собирает текст заявки, который клиент отправит одним нажатием
  function leadText(c, name, phone){
    var t = 'Здравствуйте! Интересует ' + c.name;
    var room = roomLabel(c);
    if (room) t += ', ' + room.toLowerCase().replace(/\.$/, '');
    t += '.';
    if (name)  t += '\nМеня зовут ' + name + '.';
    if (phone) t += '\nТелефон: ' + phone;
    return t;
  }

  function openManagerChat(text){
    var url = 'https://t.me/' + MANAGER + '?text=' + encodeURIComponent(text);
    if (TG && TG.openTelegramLink) TG.openTelegramLink(url);
    else window.open(url, '_blank');
  }

  function openLeadForm(){
    var c = byId[ctaBar.dataset.zhk];
    modalBody.innerHTML =
      '<h3>Заявка на '+c.name+'</h3>'
      + '<p>Заполните, и откроется чат с риелтором — текст уже будет набран, останется отправить.</p>'
      + '<div class="field"><label for="leadName">Имя</label><input id="leadName" type="text" placeholder="Как к вам обращаться" autocomplete="name"></div>'
      + '<div class="field"><label for="leadPhone">Телефон</label>'
        + '<div class="phone-wrap"><span class="phone-prefix">+7</span>'
        + '<input id="leadPhone" type="tel" inputmode="numeric" maxlength="15" placeholder="924 123-45-67" autocomplete="tel"></div></div>'
      + '<div class="modal-actions">'
        + '<button class="btn-ghost" id="leadCancel" type="button">Отмена</button>'
        + '<button class="btn-primary" id="leadSubmit" type="button">Написать риелтору</button>'
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
    document.getElementById('leadSubmit').addEventListener('click', function(){
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
        body: JSON.stringify({ clientId: SETTINGS.clientId, initData: initData, complex: c.name, room: roomLabel(c), name: name, phone: phone })
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

  document.getElementById('ctaBtn').addEventListener('click', openLeadForm);


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
    var eyebrow = document.querySelector('.home-head .eyebrow');
    var h1 = document.querySelector('.home-head h1');
    var intro = document.querySelector('.home-head p');
    if (SETTINGS.eyebrow && eyebrow) eyebrow.textContent = SETTINGS.eyebrow;
    if (SETTINGS.title && h1) h1.textContent = SETTINGS.title;
    if (SETTINGS.intro && intro) intro.textContent = SETTINGS.intro;
    var title = SETTINGS.appTitle || SETTINGS.title;
    if (title) document.title = title;
    var foot = document.getElementById('appFoot');
    if (foot) foot.textContent = SETTINGS.footer || 'Цены и условия — на даты, указанные у каждого объекта';
    var cta = document.getElementById('ctaBtn');
    if (SETTINGS.ctaText && cta) cta.textContent = SETTINGS.ctaText;
  })();

  // ---------- Telegram Mini App integration ----------
  if (TG){
    TG.ready();
    TG.expand();                                   // открыть на всю высоту экрана
    if (TG.disableVerticalSwipes) { try { TG.disableVerticalSwipes(); } catch(e){} }
    if (TG.setHeaderColor)     { try { TG.setHeaderColor(SETTINGS.accent || '#0E6E64'); } catch(e){} }
    if (TG.setBackgroundColor) { try { TG.setBackgroundColor('#F3F1EC'); } catch(e){} }

    if (TG.BackButton){
      TG.BackButton.onClick(goHome);
      TG.BackButton.hide();
    }

    // прямые ссылки: t.me/<bot>/<app>?startapp=moygorod → сразу карточка ЖК
    var start = (TG.initDataUnsafe && TG.initDataUnsafe.start_param) || '';
    if (!start){
      var m = location.search.match(/[?&]startapp=([A-Za-z0-9_-]+)/);
      if (m) start = m[1];
    }
    if (start && byId[start]) openDetail(start);
  } else {
    // тот же параметр работает и в обычном браузере — удобно для проверки
    var m2 = location.search.match(/[?&]startapp=([A-Za-z0-9_-]+)/);
    if (m2 && byId[m2[1]]) openDetail(m2[1]);
  }

})();
