(function(window){
  'use strict';

  function create(options){
    options = options || {};
    var endpoint = String(options.endpoint || '').trim();
    var initData = String(options.initData || '');
    var fetchImpl = options.fetchImpl || (window.fetch && window.fetch.bind(window));
    var opened = false;

    function send(event, item){
      if (!endpoint || !initData || !fetchImpl || !item) return;
      var id = String(item.id || '').trim().slice(0, 40);
      var name = String(item.name || '').trim().slice(0, 80);
      if (!/^[A-Za-z0-9_-]+$/.test(id) || !name) return;
      try {
        Promise.resolve(fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'stat',
            initData: initData,
            data: { ev: event, id: id, name: name },
          }),
          keepalive: true,
        })).catch(function(){});
      } catch (_error) {
        // Аналитика никогда не должна мешать приложению.
      }
    }

    return {
      open: function(item){
        if (opened) return;
        opened = true;
        send('open', item);
      },
      section: function(item){ send('section', item); },
      view: function(item){ send('view', item); },
    };
  }

  window.RealtorAnalytics = { create: create };
})(window);
