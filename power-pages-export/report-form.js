// Facilitaire melding - Power Pages versie
// Gewoon JavaScript (geen React). Vereist data-i18n.js en data-locations.js.
// Koppeling via window.MoonenReport.mount('#melding-formulier', {
//   supabaseUrl: 'https://xxxx.supabase.co', supabaseAnonKey: 'eyJ...'
// });
(function () {
  'use strict';

  var LANGS = MoonenI18n.LANGUAGES;
  var T = MoonenI18n.translations;
  var COUNTRIES = MoonenLocations.COUNTRIES;
  var WOON = MoonenLocations.WOONLOCATIES;
  var KANTOOR = MoonenLocations.KANTOORLOCATIES;
  var BVZ = MoonenLocations.BVZ_LOCATIES;
  var CATEGORIEEN = MoonenLocations.CATEGORIEEN;

  var MAX_FILES = 10;
  var MAX_SIZE = 100 * 1024 * 1024;
  var ALLOWED_EXT = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|heic|heif|svg|mp4|mov|webm|avi|mp3|wav|ogg|m4a|aac)$/i;

  var FLAG_MAP = {
    nl: 'nl', en: 'gb', de: 'de', fr: 'fr', es: 'es', it: 'it', pt: 'pt',
    da: 'dk', sv: 'se', fi: 'fi', et: 'ee', lv: 'lv', lt: 'lt', pl: 'pl',
    cs: 'cz', sk: 'sk', hu: 'hu', ro: 'ro', bg: 'bg', el: 'gr', hr: 'hr',
    sl: 'si', mt: 'mt', ga: 'ie'
  };

  var TYPE_ICONS = { woonlocatie: '\u2302', kantoorlocatie: '\u{1F3E2}', brook_valley_zoo: '\u{1F992}' };

  var state, SUPABASE_URL, SUPABASE_ANON_KEY;

  function resetState() {
    state = {
      lang: null, step: 0, name: '',
      locationType: null, countryIdx: -1, location: '',
      categoryIdx: -1, description: '', extraInfo: '',
      files: [], errors: {}, submitting: false, submitError: null
    };
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function interpolate(str, vars) {
    return str.replace(/\{(\w+)\}/g, function (m, k) { return k in vars ? vars[k] : m; });
  }

  function errP(msg) { return el('p', 'ppg-error', msg); }

  function flagImg(code) {
    var img = document.createElement('img');
    img.src = 'https://flagcdn.com/w80/' + FLAG_MAP[code] + '.png';
    img.srcset = 'https://flagcdn.com/w160/' + FLAG_MAP[code] + '.png 2x';
    img.width = 28; img.height = 21; img.alt = '';
    return img;
  }

  // ------------------------------------------------------------- taalkeuze
  function renderGate(root) {
    root.innerHTML = '';
    var wrap = el('div', 'ppg-card');
    wrap.appendChild(el('h1', 'ppg-title', 'Kies uw taal'));
    wrap.appendChild(el('p', 'ppg-sub',
      'Choisissez votre langue \u00B7 Choose your language \u00B7 W\u00E4hlen Sie Ihre Sprache \u00B7 Elija su idioma'));

    var grid = el('div', 'ppg-grid');
    LANGS.forEach(function (pair) {
      var code = pair[0], label = pair[1];
      var btn = el('button', 'ppg-lang-btn');
      btn.type = 'button';
      btn.appendChild(flagImg(code));
      btn.appendChild(el('span', 'ppg-lang-label', label));
      btn.addEventListener('click', function () {
        state.lang = code;
        document.documentElement.lang = code;
        renderForm(root);
      });
      grid.appendChild(btn);
    });
    wrap.appendChild(grid);
    wrap.appendChild(el('p', 'ppg-note',
      'Klik op uw taal om door te gaan naar de melding. Click on your language to continue to the report.'));
    root.appendChild(wrap);
  }

  // -------------------------------------------------------------- formulier
  function renderForm(root) {
    root.innerHTML = '';
    var t = T[state.lang];

    var card = el('div', 'ppg-card');
    var steps = el('div', 'ppg-steps');
    t.steps.forEach(function (label, i) {
      var s = el('div', 'ppg-step' + (i === state.step ? ' ppg-step-active' : ''));
      s.appendChild(el('span', 'ppg-step-num', String(i + 1)));
      s.appendChild(el('span', null, label));
      steps.appendChild(s);
    });
    card.appendChild(steps);

    var body = el('div', 'ppg-body');
    renderStep(body);
    card.appendChild(body);

    var nav = el('div', 'ppg-nav');
    var back = el('button', 'ppg-btn', t.prev);
    back.type = 'button';
    back.disabled = state.step === 0 || state.submitting;
    back.addEventListener('click', function () {
      state.errors = {};
      state.step = Math.max(0, state.step - 1);
      renderForm(root);
    });
    nav.appendChild(back);

    if (state.step < 2) {
      var nxt = el('button', 'ppg-btn ppg-btn-dark', t.next);
      nxt.type = 'button';
      nxt.addEventListener('click', function () {
        if (validateStep()) renderForm(root);
      });
      nav.appendChild(nxt);
    } else {
      var send = el('button', 'ppg-btn ppg-btn-primary', state.submitting ? t.sending : t.send);
      send.type = 'button';
      send.disabled = state.submitting;
      send.addEventListener('click', function () { submit(root); });
      nav.appendChild(send);
    }
    card.appendChild(nav);
    root.appendChild(card);

    if (state.submitError) {
      root.appendChild(el('div', 'ppg-error-bar', state.submitError));
      state.submitError = null;
    }
  }

  function renderStep(body) {
    var t = T[state.lang];

    if (state.step === 0) {
      body.appendChild(el('h2', 'ppg-h2', t.welcomeTitle));
      body.appendChild(el('p', 'ppg-text', t.welcomeText));

      var lbl1 = el('label', 'ppg-label', t.nameLabel);
      lbl1.appendChild(el('span', 'ppg-required', ' *'));
      body.appendChild(lbl1);
      var nameInput = el('input', 'ppg-input');
      nameInput.type = 'text';
      nameInput.value = state.name;
      nameInput.placeholder = t.namePh;
      nameInput.addEventListener('input', function () { state.name = nameInput.value; });
      body.appendChild(nameInput);
      body.appendChild(el('p', 'ppg-hint', t.nameNote));
      if (state.errors.name) body.appendChild(errP(state.errors.name));
    }

    if (state.step === 1) {
      body.appendChild(el('h2', 'ppg-h2', t.typeTitle));
      body.appendChild(el('p', 'ppg-text', t.typeDesc));

      var types = [
        { v: 'woonlocatie', label: t.woon },
        { v: 'kantoorlocatie', label: t.kantoor },
        { v: 'brook_valley_zoo', label: t.zoo }
      ];
      var typeRow = el('div', 'ppg-type-row');
      types.forEach(function (tp) {
        var b = el('button', 'ppg-type-btn' + (state.locationType === tp.v ? ' ppg-type-active' : ''));
        b.type = 'button';
        b.appendChild(el('span', 'ppg-type-icon', TYPE_ICONS[tp.v]));
        b.appendChild(el('span', null, tp.label));
        b.addEventListener('click', function () {
          state.locationType = tp.v; state.countryIdx = -1; state.location = '';
          state.errors = {};
          rerender(body);
        });
        typeRow.appendChild(b);
      });
      body.appendChild(typeRow);
      if (state.errors.locationType) body.appendChild(errP(state.errors.locationType));

      if (state.locationType) {
        if (state.locationType === 'woonlocatie') {
          var lblC = el('label', 'ppg-label', t.countryLabel);
          lblC.appendChild(el('span', 'ppg-required', ' *'));
          body.appendChild(lblC);
          var selC = el('select', 'ppg-input ppg-select');
          selC.appendChild(new Option(t.chooseCountry, '-1'));
          COUNTRIES.forEach(function (c, i) { selC.appendChild(new Option(t.countries[i], String(i))); });
          selC.value = String(state.countryIdx);
          selC.addEventListener('change', function () {
            state.countryIdx = Number(selC.value); state.location = '';
            rerender(body);
          });
          body.appendChild(selC);
          if (state.errors.country) body.appendChild(errP(state.errors.country));
        }

        var noteText = state.locationType === 'woonlocatie'
          ? interpolate(t.noteWoon, { country: t.countries[state.countryIdx] || '' })
          : state.locationType === 'kantoorlocatie' ? t.noteKantoor : t.noteZoo;
        body.appendChild(el('p', 'ppg-note-box', noteText));

        var locLabelText = state.locationType === 'woonlocatie'
          ? interpolate(t.woonLocationsLabel, { country: t.countries[state.countryIdx] || '' })
          : state.locationType === 'kantoorlocatie' ? t.kantoorLocationsLabel : t.zooLocationsLabel;
        var lblL = el('label', 'ppg-label', locLabelText);
        lblL.appendChild(el('span', 'ppg-required', ' *'));
        body.appendChild(lblL);

        var selL = el('select', 'ppg-input ppg-select');
        selL.appendChild(new Option(t.chooseLocation, ''));
        var opts = state.locationType === 'woonlocatie'
          ? (state.countryIdx >= 0 ? (WOON[COUNTRIES[state.countryIdx]] || []) : [])
          : state.locationType === 'kantoorlocatie' ? KANTOOR : BVZ;
        opts.forEach(function (loc) { selL.appendChild(new Option(loc, loc)); });
        selL.value = state.location;
        selL.addEventListener('change', function () { state.location = selL.value; });
        body.appendChild(selL);
        if (state.errors.location) body.appendChild(errP(state.errors.location));
      }
    }

    if (state.step === 2) {
      body.appendChild(el('h2', 'ppg-h2', t.catTitle));
      body.appendChild(el('p', 'ppg-text', t.catDesc));

      var selCat = el('select', 'ppg-input ppg-select');
      selCat.appendChild(new Option(t.chooseCategory, '-1'));
      CATEGORIEEN.forEach(function (c, i) { selCat.appendChild(new Option(t.cats[i], String(i))); });
      selCat.value = String(state.categoryIdx);
      selCat.addEventListener('change', function () { state.categoryIdx = Number(selCat.value); });
      body.appendChild(selCat);
      if (state.errors.category) body.appendChild(errP(state.errors.category));

      var lblD = el('label', 'ppg-label', t.descLabel);
      lblD.appendChild(el('span', 'ppg-required', ' *'));
      body.appendChild(lblD);
      var desc = el('textarea', 'ppg-input ppg-textarea');
      desc.rows = 5;
      desc.placeholder = t.descPh;
      desc.value = state.description;
      desc.addEventListener('input', function () { state.description = desc.value; });
      body.appendChild(desc);
      if (state.errors.description) body.appendChild(errP(state.errors.description));

      body.appendChild(el('label', 'ppg-label', t.extraLabel + ' (' + t.optional + ')'));
      var extra = el('textarea', 'ppg-input ppg-textarea');
      extra.rows = 3;
      extra.placeholder = t.extraPh;
      extra.value = state.extraInfo;
      extra.addEventListener('input', function () { state.extraInfo = extra.value; });
      body.appendChild(extra);

      renderFiles(body, t);
    }
  }

  function renderFiles(body, t) {
    body.appendChild(el('label', 'ppg-label', t.filesLabel + ' (' + t.optional + ')'));
    var drop = el('button', 'ppg-upload');
    drop.type = 'button';
    drop.appendChild(el('span', 'ppg-upload-icon', '\u2601'));
    drop.appendChild(el('span', 'ppg-upload-main', t.upload));
    drop.appendChild(el('span', 'ppg-upload-hint', t.uploadHint));
    body.appendChild(drop);
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    drop.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      pickFiles(fileInput.files, t);
      fileInput.value = '';
      rerender(body);
    });
    body.appendChild(fileInput);

    if (state.files.length) {
      var list = el('ul', 'ppg-files');
      state.files.forEach(function (f, i) {
        var li = el('li', 'ppg-file');
        li.appendChild(el('span', 'ppg-file-name', f.name));
        li.appendChild(el('span', 'ppg-file-size', (f.size / 1048576).toFixed(1) + ' MB'));
        var rm = el('button', 'ppg-file-remove', '\u2715');
        rm.type = 'button';
        rm.addEventListener('click', function () {
          state.files.splice(i, 1);
          rerender(body);
        });
        li.appendChild(rm);
        list.appendChild(li);
      });
      body.appendChild(list);
    }
    if (state.errors.files) body.appendChild(el('p', 'ppg-warn', state.errors.files));
  }

  function pickFiles(list, t) {
    if (!list) return;
    var chosen = Array.prototype.slice.call(list);
    var bad = [];
    for (var i = 0; i < chosen.length; i++) {
      var f = chosen[i];
      if (state.files.length >= MAX_FILES) break;
      if (f.size > MAX_SIZE) { bad.push(f.name + ' (100 MB)'); continue; }
      if (!ALLOWED_EXT.test(f.name)) { bad.push(f.name); continue; }
      state.files.push(f);
    }
    state.errors.files = bad.length ? t.errFilePrefix + ' ' + bad.join(', ') : null;
  }

  function rerender(body) {
    body.innerHTML = '';
    renderStep(body);
  }

  // -------------------------------------------------------------- validatie
  function validateStep() {
    var t = T[state.lang];
    var e = {};
    if (state.step === 0 && !state.name.trim()) e.name = t.errName;
    if (state.step === 1) {
      if (!state.locationType) e.locationType = t.errType;
      if (state.locationType === 'woonlocatie' && state.countryIdx < 0) e.country = t.errCountry;
      if (state.locationType && !state.location) e.location = t.errLocation;
    }
    if (state.step === 2) {
      if (state.categoryIdx < 0) e.category = t.errCategory;
      if (state.description.trim().length < 10) e.description = t.errDesc;
    }
    state.errors = e;
    return Object.keys(e).length === 0;
  }

  // --------------------------------------------------------------- verzenden
  function submit(root) {
    if (!validateStep()) { renderForm(root); return; }
    state.submitting = true;
    renderForm(root);

    var t = T[state.lang];
    var payload = {
      name: state.name.trim(),
      location_type: state.locationType,
      country: state.locationType === 'woonlocatie' ? COUNTRIES[state.countryIdx] : null,
      location: state.location,
      category: state.categoryIdx >= 0 ? CATEGORIEEN[state.categoryIdx] : '',
      description: state.description.trim(),
      extra_info: state.extraInfo.trim() || null,
      photo_count: state.files.length,
      photo_urls: null
    };

    fetch(SUPABASE_URL + '/rest/v1/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    })
      .then(function (r) {
        if (!r.ok) throw new Error('insert ' + r.status);
        return r.json();
      })
      .then(function (rows) {
        var reportId = rows[0].id;
        if (!state.files.length) return null;

        // uploed bestanden en verzamel paden
        return Promise.all(state.files.map(function (f) {
          var safeName = f.name.replace(/[^\w.\-]+/g, '_');
          var path = reportId + '/' + Date.now() + '-' + safeName;
          return fetch(SUPABASE_URL + '/storage/v1/object/report-photos/' + path, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
              'Content-Type': f.type || 'application/octet-stream'
            },
            body: f
          }).then(function (r) {
            if (!r.ok) throw new Error('upload ' + r.status);
            return path;
          });
        })).then(function (paths) {
          return fetch(SUPABASE_URL + '/rest/v1/reports?id=eq.' + reportId, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ photo_urls: paths, photo_count: paths.length })
          }).then(function (r) {
            if (!r.ok) throw new Error('update ' + r.status);
          });
        });
      })
      .then(function () {
        renderDone(root, t);
      })
      .catch(function (err) {
        state.submitting = false;
        state.submitError = T[state.lang].errSubmit;
        renderForm(root);
        if (window.console) console.error(err);
      });
  }

  // ------------------------------------------------------------------ klaar
  function renderDone(root, t) {
    root.innerHTML = '';
    var card = el('div', 'ppg-card ppg-done');
    card.appendChild(el('h2', 'ppg-h2', t.doneTitle));
    card.appendChild(el('p', 'ppg-text', t.doneText));
    var again = el('button', 'ppg-btn ppg-btn-dark', t.doneAgain);
    again.type = 'button';
    again.addEventListener('click', function () {
      resetState();
      renderGate(root);
    });
    card.appendChild(again);
    root.appendChild(card);
  }

  // ------------------------------------------------------------------ start
  resetState();

  window.MoonenReport = {
    mount: function (selector, config) {
      var root = document.querySelector(selector);
      if (!root) throw new Error('MoonenReport: doel-element niet gevonden: ' + selector);
      SUPABASE_URL = (config.supabaseUrl || '').replace(/\/+$/, '');
      SUPABASE_ANON_KEY = config.supabaseAnonKey || '';
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        root.innerHTML = '<p style="color:#b91c1c;font-family:sans-serif">Configuratie ontbreekt: geef supabaseUrl en supabaseAnonKey op bij mount().</p>';
        return;
      }
      renderGate(root);
    }
  };
})();
