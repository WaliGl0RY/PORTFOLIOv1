(() => {
  'use strict';

  const C = window.CONTENT;
  const html = document.documentElement;
  if (!C) { html.classList.remove('motion'); return; }

  // The language is set on <html> before first paint (see the head of index.html); English is the default.
  const LANG = html.lang === 'de' ? 'de' : 'en';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  // A text in the current language; one that exists in English only (a name, a tool) is the same in both.
  const t = (v) => {
    if (v == null) return '';
    if (typeof v !== 'object') return v;
    return v[LANG] != null ? v[LANG] : v.en != null ? v.en : v;
  };
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const decor = (tag, cls) => {
    const n = el(tag, cls);
    n.setAttribute('aria-hidden', 'true');
    return n;
  };
  // Position of a node inside `root` from layout alone, so running transforms do not distort it.
  const layoutPos = (node, root) => {
    let x = 0;
    let y = 0;
    for (let n = node; n && n !== root; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return { x, y };
  };

  const gsap = window.gsap;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Without motion (reduced motion, or the animation library did not load) the page is the plain, fully readable layout.
  const motion = !!gsap && !!window.ScrollTrigger && !reduce;
  html.classList.toggle('motion', motion);
  const phone = matchMedia('(max-width: 720px)');
  const compact = matchMedia('(max-width: 1100px)'); // same breakpoint as the scene layout in style.css

  if (motion) gsap.registerPlugin(window.ScrollTrigger, window.Draggable, window.InertiaPlugin);

  /* ---------- text from content.js ---------- */

  // Writes a text into a node, with two kinds of decoration that leave the words themselves untouched:
  // - where it names a project, that name's lit letter (the "I" of WayIn) is wrapped so CSS can light it in the
  //   project's colour; the word stays whole, it reads and copies as one;
  // - where it names a company that has a mark (voize), the mark is set in front of the name as a small badge.
  const LIT = C.work.projects.filter((p) => p.lit).map((p) => ({ name: t(p.name), at: t(p.name).indexOf(p.lit), color: p.color }));
  const MARKS = C.marks || [];
  function write(node, text) {
    const parts = [];
    let rest = String(text);
    for (;;) {
      const hits = [];
      LIT.forEach((l) => { const i = rest.indexOf(l.name); if (i > -1 && l.at > -1) hits.push({ at: i + l.at, l }); });
      MARKS.forEach((m) => { const i = rest.indexOf(m.word); if (i > -1) hits.push({ at: i, m }); });
      const hit = hits.sort((a, b) => a.at - b.at)[0];
      if (!hit) break;
      parts.push(rest.slice(0, hit.at));
      if (hit.l) {
        const letter = el('span', 'lit', rest[hit.at]);
        letter.style.setProperty('--lit', hit.l.color);
        parts.push(letter);
        rest = rest.slice(hit.at + 1);
      } else {
        // the picture has an empty alt: the name right beside it already says who it is
        const img = el('img', 'brand__mark');
        img.src = hit.m.src;
        img.alt = '';
        img.width = hit.m.width;
        img.height = hit.m.height;
        img.decoding = 'async';
        const brand = el('span', 'brand');
        brand.append(img, hit.m.word);
        parts.push(brand);
        rest = rest.slice(hit.at + hit.m.word.length);
      }
    }
    if (!parts.length) {
      node.textContent = rest;
      return node;
    }
    // one wrapper around the whole text, so a flex or grid parent still sees it as a single piece
    const whole = el('span', 'nm');
    whole.append(...parts.filter((part) => part !== ''), rest);
    node.replaceChildren(whole);
    return node;
  }

  function fillText() {
    $$('[data-t]').forEach((n) => { n.textContent = t(get(n.dataset.t)); });
    $$('[data-t-aria]').forEach((n) => { n.setAttribute('aria-label', t(get(n.dataset.tAria))); });
    $$('[data-mail]').forEach((a) => { a.href = 'mailto:' + C.email; });

    // Wraps each word so headlines can rise out of a mask; words stay whole for screen readers.
    $$('[data-words]').forEach((n) => {
      const words = n.textContent.trim().split(/\s+/);
      n.textContent = '';
      words.forEach((w, i) => {
        const mask = el('span', 'w');
        mask.append(el('span', '', w));
        n.append(mask);
        if (i < words.length - 1) n.append(' ');
      });
    });
  }

  function buildJourney() {
    const list = $('#journey-stops');
    C.path.milestones.forEach((m, i) => {
      // lanes alternate; a milestone without a date is one of the big stations
      const li = el('li', `ms ms--${i % 2 ? 'r' : 'l'}${m.date ? '' : ' ms--major'}`);
      const text = el('div', 'ms__text');
      if (m.date) {
        const time = el('time', 'ms__date', m.date);
        time.dateTime = m.date.split('/').reverse().join('-');
        text.append(time);
      }
      text.append(write(el(m.date ? 'p' : 'h3', 'ms__name'), t(m.name)));
      if (m.note) text.append(el('p', 'ms__note', t(m.note)));
      if (m.via) {
        // a second line, set apart as a small chip in the project's colour: it leads down to that project's
        // deep dive and opens it there. The arrow that ends the text is its own piece, so it can move on hover.
        const to = C.work.projects.findIndex((p) => p.id === m.via.project);
        const [, words, arrow] = t(m.via.text).match(/^(.*?)(\s*→)?$/);
        const link = el('a', 'ms__link');
        link.style.setProperty('--pc', C.work.projects[to].color);
        link.append(write(el('span', 'ms__link-text'), words));
        if (arrow) link.append(el('span', 'ms__link-arrow', arrow));
        link.href = '#work';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          links.toProject(to, { scroll: true, focus: true });
        });
        const via = el('p', 'ms__via');
        via.append(link);
        text.append(via);
      }
      if (m.logo) {
        // The institution's logo on the same line as its name, right after it; the note stays on the line below.
        // It is put in only once the file has loaded, so a missing file leaves the milestone as plain text.
        // Empty alt: the name is right beside it.
        const probe = new Image();
        probe.onload = () => {
          const img = el('img', 'ms__logo');
          img.src = m.logo;
          img.alt = '';
          img.width = probe.naturalWidth;
          img.height = probe.naturalHeight;
          const name = $('.ms__name', text);
          name.classList.add('ms__name--logo');
          name.append(img);
        };
        probe.src = m.logo;
      }
      li.append(text, decor('span', 'ms__node'));
      list.append(li);
    });
  }

  // The bridge sentence: its last word is the one that sits a little loose, and the road tangles under it.
  function buildBridge() {
    const last = $$('#bridge-say .w').pop();
    if (last) last.classList.add('bridge__loose');
  }

  function buildHow() {
    C.how.problems.forEach((p) => $('#how-problems').append(el('li', 'chip', t(p))));
    C.how.ideas.forEach((p) => $('#how-ideas').append(el('li', 'chip chip--idea', t(p))));
  }

  // The skills section and the deep dive point at each other: a skill's projects open their deep dive, and a
  // deep-dive tag opens its skill. Each side registers its entry point here once it is built.
  const links = { toSkill: () => {}, toProject: () => {} };

  /* ---------- skills: what I used, and where it ran ---------- */

  function initSkills() {
    const S = C.skills;
    const projects = C.work.projects;
    const status = $('#used-status');

    const buttons = S.used.map((skill) => {
      const button = el('button', 'skill', t(skill.name));
      button.type = 'button';
      button.dataset.skill = skill.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-controls', 'used-projects');
      button.addEventListener('click', () => show(skill.id, { announce: true }));
      $('#used-skills').append(button);
      return button;
    });

    const tiles = projects.map((p, i) => {
      const tile = el('button', 'ran');
      tile.type = 'button';
      tile.style.setProperty('--pc', p.color);
      const top = el('span', 'ran__top');
      top.append(decor('span', 'ran__dot'), write(el('span', 'ran__name'), t(p.name)), el('span', 'ran__go', t(S.toDive)));
      const note = el('span', 'ran__note');
      tile.append(top, note);
      tile.addEventListener('click', () => links.toProject(i, { scroll: true, focus: true }));
      $('#used-projects').append(tile);
      return { tile, note, project: p };
    });

    function show(id, { announce = false, scroll = false, focus = false } = {}) {
      const skill = S.used.find((s) => s.id === id);
      if (!skill) return;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.skill === id)));
      const ran = [];
      tiles.forEach(({ tile, note, project }) => {
        const line = skill.where[project.id];
        tile.classList.toggle('is-lit', !!line);
        note.textContent = t(line || S.notHere);
        if (line) ran.push(t(project.name));
      });
      if (motion) {
        const lit = tiles.filter(({ tile }) => tile.classList.contains('is-lit')).map(({ note }) => note);
        gsap.fromTo(lit, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', overwrite: true });
      }
      if (announce) status.textContent = `${t(skill.name)} ${t(S.ranIn)} ${ran.join(', ')}.`;
      if (scroll) scrollToNode($('#skills'));
      if (focus) buttons.find((b) => b.dataset.skill === id).focus({ preventScroll: true });
    }

    // from my studies: plain groups of plain text; nothing here is a control
    S.studies.forEach((group, i) => {
      const label = el('h4', 'studies__label', t(group.label));
      label.id = 'studies-group-' + i;
      const list = el('ul', 'studies__items');
      list.setAttribute('aria-labelledby', label.id);
      group.items.forEach((item) => list.append(el('li', 'studies__item', t(item))));
      const box = el('div', 'studies__group');
      box.append(label, list);
      $('#studies-groups').append(box);
    });
    links.toSkill = (id) => show(id, { announce: true, scroll: true, focus: true });
    show(S.used[0].id);
  }

  /* ---------- contact ---------- */

  function buildContact() {
    C.contact.beats.forEach((beat) => $('#contact-beats').append(el('p', 'beat', t(beat))));

    // The languages. The page contains the whole sentence, and that is what is read out; what is shown of it
    // are the language names, as a quiet row. The words between them are kept, only not displayed.
    const L = C.contact.languages;
    const sentence = t(L.text);
    const row = $('#langs-row');
    let at = 0;
    t(L.names).forEach((name) => {
      const i = sentence.indexOf(name, at);
      if (i < 0) return;
      if (i > at) row.append(el('span', 'sr', sentence.slice(at, i)));
      row.append(el('span', 'langs__name', name));
      at = i + name.length;
    });
    if (at < sentence.length) row.append(el('span', 'sr', sentence.slice(at)));

    $('#mail-text').textContent = C.email;
    const gh = $('#github-link');
    gh.href = C.github.url;
    gh.textContent = t(C.github.label);

    const status = $('#mail-status');
    let timer;
    $('#mail-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(C.email);
        status.textContent = t(C.contact.copied);
        clearTimeout(timer);
        timer = setTimeout(() => { status.textContent = ''; }, 2400);
      } catch (err) {
        location.href = 'mailto:' + C.email;
      }
    });

    // The CV button appears on its own once the file is there.
    const cv = $('#cv-link');
    fetch(C.contact.cvFile, { method: 'HEAD' })
      .then((res) => { if (res.ok) { cv.href = C.contact.cvFile; cv.hidden = false; } })
      .catch(() => {});
  }

  /* ---------- smooth scroll + progress ---------- */

  let lenis = null;
  const scrollToNode = (target) => {
    if (lenis) lenis.scrollTo(target);
    else target.scrollIntoView();
  };

  function initScroll() {
    if (motion && window.Lenis) {
      lenis = new window.Lenis({ lerp: 0.11 });
      lenis.on('scroll', window.ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.closest('.pw')) return;
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      scrollToNode(target);
      if (a.classList.contains('skip')) target.focus({ preventScroll: true });
    });

    const bar = $('.progress__bar');
    let queued = false;
    const paint = () => {
      queued = false;
      const max = html.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max) : 0})`;
    };
    const request = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    paint();
  }

  /* ---------- language: DE / EN ---------- */

  // Every animated piece of the page is built from its text, so a change of language reloads the page into the
  // other language and returns to the same place. The place is kept as a section and a share of it, because
  // the sections are not the same height in both languages.
  function initLang() {
    const host = $('#lang');
    const place = () => {
      let at = null;
      $$('main > section').forEach((s) => { if (!at || s.getBoundingClientRect().top <= 1) at = s; });
      const top = at.getBoundingClientRect().top + scrollY;
      return { id: at.id, p: (scrollY - top) / Math.max(1, at.offsetHeight) };
    };
    C.nav.langs.forEach((l) => {
      const button = el('button', 'lang__btn', l.short);
      button.type = 'button';
      button.lang = l.code;
      button.setAttribute('aria-label', l.name);
      button.setAttribute('aria-pressed', String(l.code === LANG));
      button.addEventListener('click', (e) => {
        if (l.code === LANG) return;
        try {
          localStorage.setItem('lang', l.code);
          sessionStorage.setItem('lang-at', JSON.stringify({ ...place(), focus: e.detail === 0 }));
        } catch (err) { return; } // without storage the choice could not be kept, so nothing changes
        location.reload();
      });
      host.append(button);
    });
  }

  // After a language switch: back to where the reader was, and focus back on the switch if it was used by keyboard.
  function restorePlace() {
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem('lang-at'));
      sessionStorage.removeItem('lang-at');
    } catch (err) { /* nothing was saved */ }
    if (!saved) return;
    let moved = false;
    const go = () => {
      const section = document.getElementById(saved.id);
      if (!section || moved) return;
      const y = section.getBoundingClientRect().top + scrollY + saved.p * section.offsetHeight;
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else scrollTo(0, y);
    };
    ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((type) => addEventListener(type, () => { moved = true; }, { once: true, passive: true }));
    go();
    // text settles once the fonts are in: find the place once more then, unless the reader has moved on
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
    addEventListener('load', () => { go(); history.scrollRestoration = 'auto'; }, { once: true });
    if (saved.focus) $('.lang__btn[aria-pressed="true"]').focus({ preventScroll: true });
  }

  /* ---------- the three scroll-scrubbed video scenes ---------- */

  // A timeline of length 1 tied to the scene's scroll, so every position below is a share of the scene.
  const scrubbed = (scene, extra) => gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: scene.el, start: 'top top', end: 'bottom bottom', scrub: 0.5, ...extra }
  });
  const part = (scene, name) => $(`[data-s="${name}"]`, scene.el);
  // Opacity only (never visibility), so the text stays readable for screen readers and reachable by keyboard.
  const rise = (tl, node, at, dur = 0.08) => tl.fromTo(node, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: dur }, at);
  // One tween per word: a staggered tween loses the hidden start of its later words when the timeline is re-measured.
  const words = (tl, node, at) => $$('.w > span', node).forEach((word, i) => {
    tl.fromTo(word, { yPercent: 115 }, { yPercent: 0, ease: 'power3.out', duration: 0.1 }, at + i * 0.015);
  });
  const vignette = (tl, scene, from, at, dur) => tl.fromTo($('.scene__vignette', scene.el), { opacity: from }, { opacity: 1, ease: 'none', duration: dur }, at);

  // The name as a solid: how many copies are stacked behind each face, and the angles (degrees about the vertical
  // axis) of "Walid" and "Ragoub" at rest and at the start. At the start both are turned far round towards the
  // side he is looking to when the clip begins, so they are seen almost edge-on. Each word is seen from where his
  // head is (the vanishing point lies there), "Walid" from its right and "Ragoub" from its left, which is why the
  // same apparent turn of about 78 degrees takes a different angle for each.
  const NAME_LAYERS = 12;
  const NAME_REST = [7, -7];
  const NAME_FROM = [-62, -99];
  // Edge colour from the face back: the cyan of the shot's rim light, falling off to deep teal.
  const NAME_EDGE = [[165, 243, 252], [34, 211, 238], [8, 51, 68]];

  function buildName() {
    if (!motion) return; // without motion the name stays flat
    $$('.name__solid').forEach((solid) => {
      const face = $('.name__face', solid);
      for (let i = NAME_LAYERS; i >= 1; i--) {
        const share = (i - 1) / (NAME_LAYERS - 1);
        const [a, b] = share < 0.25 ? [NAME_EDGE[0], NAME_EDGE[1]] : [NAME_EDGE[1], NAME_EDGE[2]];
        const mix = share < 0.25 ? share / 0.25 : (share - 0.25) / 0.75;
        const layer = decor('span', 'name__depth');
        layer.dataset.text = face.textContent; // drawn by CSS, so the page still contains the name only once
        layer.style.setProperty('--i', i);
        layer.style.color = `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * mix)).join(', ')})`;
        // the copy right behind the face carries the glow of the light, the last one the shadow the word casts
        if (i === 1) layer.style.textShadow = '0 0 .18em rgba(34, 211, 238, .45)';
        if (i === NAME_LAYERS) layer.style.textShadow = '0 .08em .5em rgba(0, 0, 0, .75)';
        solid.insertBefore(layer, face);
      }
    });
  }

  // The bio as words, so it can be revealed line by line; its key phrases are set in bold.
  function buildBio() {
    const host = $('#hero-bio');
    const text = t(C.hero.bio);
    const keys = (t(C.hero.bioKeys) || []).map((key) => [text.indexOf(key), text.indexOf(key) + key.length]).filter(([from]) => from > -1);
    let at = 0;
    text.split(' ').forEach((word, i, all) => {
      const key = keys.find(([from, to]) => at >= from && at < to);
      const span = el('span', 'bw');
      if (key) {
        // only the part inside the phrase is bold, not the comma or full stop after it
        const cut = Math.min(word.length, key[1] - at);
        span.append(el('strong', '', word.slice(0, cut)), word.slice(cut));
      } else {
        span.textContent = word;
      }
      host.append(span);
      if (i < all.length - 1) host.append(' ');
      at += word.length + 1;
    });

    // Number every word's line; redone whenever the paragraph wraps differently.
    const words = $$('.bw', host);
    const number = () => {
      let line = -1;
      let top = null;
      words.forEach((word) => {
        if (word.offsetTop !== top) { top = word.offsetTop; line++; }
        word.style.setProperty('--l', line);
      });
      host.parentNode.style.setProperty('--n', line + 1);
    };
    number();
    addEventListener('resize', number);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(number);
  }

  function heroTimeline(scene) {
    const sides = $$('.name__side', scene.el);
    const nameWords = $$('.name__word', scene.el);
    const split = matchMedia('(min-width: 901px) and (min-aspect-ratio: 5/4)'); // same condition as the split name in style.css
    const frame = () => Math.max(scene.stage.clientWidth, (scene.stage.clientHeight * 16) / 9);
    // The camera turns during the first 1.5 s of the clip (0 to 0.34 of the scene); the background travels
    // about a fifth of the frame to the left. The two words travel with it, as if they stood in the room:
    // "Walid" comes out from behind his head, "Ragoub" drifts in from the right. After that his head keeps
    // easing left for the rest of the clip, and the words stay with it.
    const swing = () => (split.matches ? 0.2 * frame() : 0);
    const follow = () => (split.matches ? -0.035 * frame() : 0);

    const tl = scrubbed(scene, { invalidateOnRefresh: true });
    vignette(tl, scene, 0.3, 0.1, 0.3);
    tl.fromTo(part(scene, 'hint'), { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.08 }, 0.02);
    tl.fromTo(nameWords, { x: swing, y: () => (split.matches ? 0 : 20) }, { x: 0, y: 0, ease: 'power1.out', duration: 0.34 }, 0);
    tl.fromTo(nameWords, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.07 }, 0.01);
    // In the clip he looks away to one side at first and turns his face to the camera while it swings round,
    // slowly at first and done by 1.5 s. The words do the same: they start turned the way he is looking, almost
    // edge-on with little more than their lit edges showing, and come round with his face, so they are only
    // clear once he faces us. At rest each word stays angled a little towards his head.
    $$('.name__solid', scene.el).forEach((solid, i) => {
      tl.fromTo(solid, { rotationY: NAME_FROM[i % NAME_FROM.length] }, { rotationY: NAME_REST[i % NAME_REST.length], ease: 'power1.inOut', duration: 0.34 }, 0);
    });
    tl.fromTo(sides, { x: 0 }, { x: follow, ease: 'none', duration: 0.66, immediateRender: false }, 0.34);

    // The bio: its backing first, then the lines one after another (--bio drives the reveal in style.css).
    tl.fromTo(part(scene, 'scrim'), { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.06 }, 0.36);
    rise(tl, part(scene, 'eyebrow'), 0.4, 0.05);
    tl.fromTo(part(scene, 'bio'), { '--bio': 0 }, { '--bio': 1, ease: 'none', duration: 0.2 }, 0.42);
    rise(tl, part(scene, 'hook'), 0.62);
    rise(tl, part(scene, 'btns'), 0.68);
    tl.set({}, {}, 1);
    scene.liveAt = 0.68;
  }

  // Where each note lands while it is still chaos: [x, y] of its centre as a share of the stage, then its tilt.
  // The clip shows typing until ~0.31, a serious lean back until ~0.56 and the smile from ~0.62.
  const CHAOS = {
    wide: {
      problems: [
        [0.76, 0.24, -10], [0.885, 0.385, 13], [0.70, 0.47, -12], [0.19, 0.45, 8], [0.125, 0.66, -8], [0.84, 0.61, 7], [0.23, 0.80, -4],
        [0.48, 0.14, 6], [0.79, 0.14, -4], [0.47, 0.905, 3]
      ],
      ideas: [[0.72, 0.75, 2], [0.87, 0.84, -2], [0.15, 0.555, -2]]
    },
    tight: {
      problems: [
        [0.36, 0.30, -5], [0.66, 0.342, 6], [0.33, 0.384, 8], [0.68, 0.426, -7], [0.35, 0.468, -4], [0.64, 0.51, 5], [0.44, 0.552, -3],
        [0.62, 0.594, 4], [0.5, 0.636, -2], [0.46, 0.678, 3]
      ],
      ideas: [[0.62, 0.74, 2], [0.38, 0.79, -2], [0.60, 0.84, 2]]
    }
  };
  const chaosSet = () => CHAOS[compact.matches ? 'tight' : 'wide'];
  // The road comes into the scene down its right side and stops at ROAD_END (a share of the stage), at the year.
  // The first FIRST problems arrive while the scene is still rising into place: each comes a short way from the
  // direction of the road's end and lands with a small overshoot, so it is readable almost at once and all of
  // them are in place before anything is said. Then one line, then the title; the rest of the problems fly in
  // from the directions in FLY_IN.
  const ROAD_IN = 0.955; // where the road crosses from the bridge into the scene, as a share of the width
  const ROAD_END = [0.94, 0.2];
  const FIRST = 3;
  const FROM_ROAD = 0.42; // how much of the way from its place towards the road's end a first problem starts
  const FLY_IN = [[-0.5, -0.2], [-0.5, 0.3], [0.5, 0.4], [-0.3, 0.6], [0, -0.5], [0.4, -0.45], [0, 0.5]];
  // The first problems arrive while the scene's top edge travels this share of the viewport up to the top:
  // it starts when the dot (riding at 0.58 of the viewport) reaches the road's end.
  const ARRIVAL_RISE = 0.38;
  const HOW = { line: 0.015, title: 0.15, roadOut: 0.19, problems: 0.215, problemGap: 0.027, ideas: 0.45, ideaGap: 0.032, order: 0.6, cards: 0.74 };
  // Problems are larger while they are chaos and shrink into their place in the list (less so where space is tight).
  const loud = () => (compact.matches ? 1.04 : 1.22);

  function howTimeline(scene) {
    const stage = scene.stage;
    const board = $('#how-board');
    const groups = { problems: $$('#how-problems .chip'), ideas: $$('#how-ideas .chip') };
    // Offset from a note's tidy place in the lists to its place in the chaos.
    const spot = (group, i) => {
      const [fx, fy, tilt] = chaosSet()[group][i];
      const chip = groups[group][i];
      const at = layoutPos(chip, stage);
      return {
        x: fx * stage.clientWidth - (at.x + chip.offsetWidth / 2),
        y: fy * stage.clientHeight - (at.y + chip.offsetHeight / 2),
        tilt
      };
    };
    // Where a first problem starts: part of the way from its place towards the road's end.
    const fromRoad = (chip, i) => {
      const at = layoutPos(chip, stage);
      const here = spot('problems', i);
      const road = {
        x: ROAD_END[0] * stage.clientWidth - (at.x + chip.offsetWidth / 2),
        y: ROAD_END[1] * stage.clientHeight - (at.y + chip.offsetHeight / 2)
      };
      return { x: here.x + (road.x - here.x) * FROM_ROAD, y: here.y + (road.y - here.y) * FROM_ROAD };
    };

    // 0 · the arrival, while the scene is still rising into place: "Eight exams", "No job" and "Pressure" land
    //     one after another, each from the direction of the road's end. No lines: only the notes move. All three
    //     are in place, full size and fully visible, by the time the scene pins.
    const arrival = gsap.timeline();
    groups.problems.slice(0, FIRST).forEach((chip, i) => {
      const start = 0.12 + i * 0.16;
      const length = 0.56;
      arrival.fromTo(chip, {
        x: () => fromRoad(chip, i).x, y: () => fromRoad(chip, i).y,
        rotation: () => spot('problems', i).tilt * 3, scale: 0.7
      }, {
        x: () => spot('problems', i).x, y: () => spot('problems', i).y,
        rotation: () => spot('problems', i).tilt, scale: loud, ease: 'back.out(1.4)', duration: length
      }, start);
      arrival.fromTo(chip, { opacity: 0 }, { opacity: 1, ease: 'none', duration: length * 0.25 }, start);
    });
    arrival.set({}, {}, 1);

    // The scene itself: a timeline of length 1 over the pinned scroll, like the other two scenes.
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    vignette(tl, scene, 0.35, 0, 0.14);
    // the fade that brought the picture up out of the page goes as the vignette comes in
    tl.fromTo($('.how__seam', scene.el), { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.12 }, 0);
    tl.fromTo(part(scene, 'hint'), { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.06 }, 0.02);

    // 1 · the three problems are in place: one line says what they are doing here, and gives way to the title
    const line = part(scene, 'line');
    tl.fromTo(line, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.04 }, HOW.line);
    tl.fromTo(line, { opacity: 1, y: 0 }, { opacity: 0, y: -14, ease: 'power1.in', duration: 0.03, immediateRender: false }, HOW.title - 0.03);

    // 2 · the title, then the road steps back
    rise(tl, part(scene, 'eyebrow'), HOW.title, 0.05);
    words(tl, part(scene, 'title'), HOW.title + 0.02);
    tl.fromTo('#how-road', { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.08, immediateRender: false }, HOW.roadOut);

    // 3 · the rest of the problems pile up, each from its own direction
    groups.problems.slice(FIRST).forEach((chip, n) => {
      const i = n + FIRST;
      const [dx, dy] = FLY_IN[n % FLY_IN.length];
      tl.fromTo(chip, {
        x: () => spot('problems', i).x + dx * stage.clientWidth,
        y: () => spot('problems', i).y + dy * stage.clientHeight,
        rotation: () => spot('problems', i).tilt * 4, opacity: 0, scale: 0.85
      }, {
        x: () => spot('problems', i).x,
        y: () => spot('problems', i).y,
        rotation: () => spot('problems', i).tilt, opacity: 1, scale: loud, ease: 'back.out(1.3)', duration: 0.06
      }, HOW.problems + n * HOW.problemGap);
    });

    // 4 · ideas arrive, calmly
    groups.ideas.forEach((chip, i) => {
      tl.fromTo(chip, {
        x: () => spot('ideas', i).x, y: () => spot('ideas', i).y + 46,
        rotation: () => spot('ideas', i).tilt, opacity: 0, scale: 0.92
      }, {
        x: () => spot('ideas', i).x, y: () => spot('ideas', i).y,
        rotation: () => spot('ideas', i).tilt, opacity: 1, scale: 1, duration: 0.06
      }, HOW.ideas + i * HOW.ideaGap);
    });

    // 5 · everything snaps into its place in the two lists
    Object.keys(groups).forEach((group) => groups[group].forEach((chip, i) => {
      tl.fromTo(chip, {
        x: () => spot(group, i).x, y: () => spot(group, i).y, rotation: () => spot(group, i).tilt,
        scale: group === 'problems' ? loud : 1
      }, {
        x: 0, y: 0, rotation: 0, scale: 1, ease: 'expo.inOut', duration: 0.09, immediateRender: false
      }, HOW.order + i * 0.003);
    }));
    tl.fromTo($$('.how__label', board), { opacity: 0 }, { opacity: 1, duration: 0.05 }, HOW.order + 0.06);

    // 6 · out of that order the three projects come up
    // The sorted notes step back for the cards but stay readable: at 0.6 their text keeps more than 4.5:1 over the video.
    tl.fromTo(board, { opacity: 1 }, { opacity: () => (compact.matches ? 0 : 0.6), ease: 'none', duration: 0.06, immediateRender: false }, HOW.cards - 0.01);
    $$('.slot', scene.el).forEach((slot, i) => {
      tl.fromTo(slot, { opacity: 0, y: () => (compact.matches ? 40 : -70), scale: 0.6 }, { opacity: 1, y: 0, scale: 1, ease: 'back.out(1.5)', duration: 0.09 }, HOW.cards + i * 0.035);
    });
    tl.set({}, {}, 1);
    scene.liveAt = HOW.cards + 0.06;

    // Both run on one scroll-driven timeline, so they can never disagree about a note after a fast jump:
    // the arrival over the last ARRIVAL_RISE viewport heights before the scene pins, the scene over the pinned scroll.
    const pinned = scene.el.offsetHeight / innerHeight - 1; // pinned scroll, in viewport heights
    gsap.timeline({
      scrollTrigger: { trigger: scene.el, start: `top ${ARRIVAL_RISE * 100}%`, end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true }
    }).add(arrival.duration(ARRIVAL_RISE), 0).add(tl.duration(pinned), ARRIVAL_RISE);
  }

  // The contact clip: profile until ~0.15 of the scene, the turn until ~0.33, then facing us, and the smile
  // holds from ~0.66. Four lines take turns over the first two thirds, each fading in as the one before
  // fades out; the closing block arrives on the smile.
  const BEATS = { first: 0.04, each: 0.155, fade: 0.04 };

  function contactTimeline(scene) {
    const tl = scrubbed(scene);
    vignette(tl, scene, 0.6, 0, 0.1);
    $$('.beat', scene.el).forEach((beat, i) => {
      const start = BEATS.first + i * BEATS.each;
      tl.fromTo(beat, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: BEATS.fade }, start);
      tl.fromTo(beat, { opacity: 1, y: 0 }, { opacity: 0, y: -12, ease: 'power1.in', duration: BEATS.fade, immediateRender: false }, start + BEATS.each);
    });
    rise(tl, part(scene, 'eyebrow'), 0.68, 0.05);
    words(tl, part(scene, 'title'), 0.7);
    rise(tl, part(scene, 'sub'), 0.77);
    rise(tl, part(scene, 'mail'), 0.81);
    rise(tl, part(scene, 'btns'), 0.85);
    rise(tl, part(scene, 'langs'), 0.89, 0.05);
    tl.set({}, {}, 1);
    scene.liveAt = 0.85;
  }

  async function loadVideo(scene) {
    const res = await fetch(scene.video.dataset.src);
    if (!res.ok) throw new Error(`video ${res.status}`);
    const blob = await res.blob();
    await new Promise((resolve, reject) => {
      scene.video.addEventListener('loadeddata', resolve, { once: true });
      scene.video.addEventListener('error', reject, { once: true });
      scene.video.src = URL.createObjectURL(blob);
      scene.video.load();
    });
    scene.dur = scene.video.duration || 0;
    scene.cur = scene.p * scene.dur;
    scene.video.currentTime = scene.cur;
    scene.ready = scene.dur > 0;
    scene.el.classList.toggle('is-ready', scene.ready);
  }

  function initScenes() {
    if (!motion) return; // posters stay; CSS lays the scenes out as normal sections
    const timelines = { hero: heroTimeline, how: howTimeline, contact: contactTimeline };
    const scenes = $$('.scene').map((node) => ({
      el: node, stage: $('.scene__stage', node), video: $('video', node),
      p: 0, cur: 0, dur: 0, ready: false, live: false, liveAt: 1
    }));

    scenes.forEach((scene) => {
      timelines[scene.el.dataset.scene](scene);
      // Keyboard focus landing on a control that has not appeared yet scrolls the scene to where it is visible.
      scene.el.addEventListener('focusin', (e) => {
        if (scene.p >= scene.liveAt + 0.08 || !e.target.matches(':focus-visible')) return;
        const top = scene.el.getBoundingClientRect().top + scrollY + (scene.el.offsetHeight - innerHeight) * 0.94;
        if (lenis) lenis.scrollTo(top, { immediate: true });
        else scrollTo(0, top);
      });
    });

    // Target time = progress x duration, eased towards it every frame.
    const tick = () => {
      const vh = innerHeight;
      for (const s of scenes) {
        const r = s.el.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) continue;
        s.p = clamp(-r.top / Math.max(1, r.height - vh));
        const live = s.p > s.liveAt; // controls are clickable only once they have started to appear
        if (live !== s.live) { s.live = live; s.el.classList.toggle('is-live', live); }
        if (!s.ready) continue;
        const target = s.p * s.dur;
        s.cur += (target - s.cur) * 0.16;
        if (Math.abs(target - s.cur) < 0.002) s.cur = target;
        const time = Math.min(s.cur, s.dur - 0.05);
        if (!s.video.seeking && Math.abs(s.video.currentTime - time) > 0.012) s.video.currentTime = time;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // One after another, hero first, so the first screen is never starved.
    (async () => {
      for (const s of scenes) {
        try { await loadVideo(s); } catch (err) { /* the poster stays */ }
      }
    })();
  }

  /* ---------- the road: from the end of the bio, through the milestones, under the bridge sentence, into the scene ---------- */

  // The hero's video frame as it covers the stage; the name beside his head is placed in shares of it (see style.css).
  function fitHeroFrame() {
    const scene = $('.scene--hero');
    const stage = $('.scene__stage', scene);
    const fit = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      scene.style.setProperty('--fw', Math.max(w, (h * 16) / 9) + 'px');
      scene.style.setProperty('--fh', Math.max(h, (w * 9) / 16) + 'px');
    };
    fit();
    addEventListener('resize', fit);
  }

  function initRoad() {
    const DOT_LINE = 0.58; // the dot rides at this height of the viewport while the page moves under it
    const HERO_FROM = 0.76; // share of the hero scene at which the line starts to leave the bio
    const heroScene = $('.scene--hero');
    const heroBox = $('.hero', heroScene);
    const heroText = $('.hero__text', heroBox);
    const start = $('#road-start');
    const journey = $('#journey');
    const bridge = $('#bridge');
    const bridgeStage = $('.bridge__stage', bridge);
    const say = $('#bridge-say');
    const stage = $('.scene--how .scene__stage');
    const stops = $$('.ms', journey);
    const nodes = $$('.ms__node', journey);
    const captions = C.path.milestones.map((m) => t(m.tag));
    const tag = $('#journey-tag');
    const endTag = $('#how-end');

    // The road is four stretches, one per section, that meet at the section edges.
    const stretch = (svg, box) => ({
      svg, box, paths: $$('path', svg), line: $('.road__line', svg), dot: $('.road__dot', svg), length: 0, ys: []
    });
    const inHero = stretch($('#road-hero'), heroBox);
    const inPath = stretch($('#road-path'), journey);
    const inBridge = stretch($('#road-bridge'), bridgeStage);
    const inScene = stretch($('#road-how'), stage);
    let marks = []; // length along the path stretch at which each milestone is reached
    // The bridge stretch has three legs: down beside the sentence, along under it, and down to the scene.
    let legs = [0, 0, 0];
    let travelled = -1; // how far along those legs the road was last drawn (0 to 3), kept so --p is only set on a change
    let end = { x: 0, y: 0 }; // where the road stops inside the scene
    let caption = -1;
    let tagRight = true; // which side of the dot the caption is on
    let crossAt = 0; // time at which a caption that is fading out may reappear on the other side
    let queued = false;
    const request = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } };

    const SAMPLES = 240;
    const shape = (s, d) => {
      s.svg.setAttribute('viewBox', `0 0 ${s.box.offsetWidth} ${s.box.offsetHeight}`);
      s.paths.forEach((p) => p.setAttribute('d', d));
      s.length = s.line.getTotalLength();
      s.line.style.strokeDasharray = s.length;
      s.ys = Array.from({ length: SAMPLES + 1 }, (_, i) => s.line.getPointAtLength((s.length * i) / SAMPLES).y);
    };
    // The path and scene stretches only ever run downward, so a height finds its length by bisection.
    const lengthAt = (s, y) => {
      let lo = 0;
      let hi = SAMPLES;
      if (y <= s.ys[0]) return 0;
      if (y >= s.ys[hi]) return s.length;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (s.ys[mid] <= y) lo = mid;
        else hi = mid;
      }
      const span = s.ys[hi] - s.ys[lo] || 1;
      return (s.length * (lo + (y - s.ys[lo]) / span)) / SAMPLES;
    };
    // Smooth curve that passes each point heading straight down, so the road sways from lane to lane.
    const sway = (pts) => pts.slice(1).reduce((d, b, i) => {
      const a = pts[i];
      const half = (b.y - a.y) / 2;
      return `${d} C${a.x},${a.y + half} ${b.x},${b.y - half} ${b.x},${b.y}`;
    }, `M${pts[0].x},${pts[0].y}`);
    // The one untidy place on the road. Between `from` and `to` the line loses its way: it winds forward and back
    // over itself while it dips below its level, a second, slower winding keeping the loops uneven. The winding
    // grows slowly out of the straight line and settles back into it as slowly, so both ends meet the road at
    // its level, heading along it. Returns the points and the length of the line through them.
    const tangle = (from, to, level, size) => {
      const loops = clamp(Math.round((to - from) / (0.5 * size)), 4, 6);
      const steps = loops * 32;
      const ease = (v) => { const c = clamp(v); return c * c * (3 - 2 * c); };
      const pts = [];
      let length = 0;
      for (let i = 0; i <= steps; i++) {
        const s = i / steps;
        const turn = s * loops * 2 * Math.PI;
        const swell = Math.min(ease(s / 0.46), ease((1 - s) / 0.38));
        const x = from + (to - from) * s - swell * size * (0.36 * Math.sin(turn) + 0.12 * Math.sin(1.7 * turn));
        const y = level + swell * size * (0.25 * (1 - Math.cos(turn)) + 0.08 * (1 - Math.cos(1.7 * turn)));
        if (i) length += Math.hypot(x - pts[i - 1].x, y - pts[i - 1].y);
        pts.push({ x, y });
      }
      return { d: pts.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '), length };
    };

    const draw = (s, length, showDot) => {
      s.line.style.strokeDashoffset = s.length - length;
      s.dot.classList.toggle('is-on', showDot);
      if (!showDot) return null;
      const at = s.line.getPointAtLength(length);
      s.dot.setAttribute('cx', at.x);
      s.dot.setAttribute('cy', at.y);
      return at;
    };

    const update = () => {
      if (!motion) {
        // finished state: the whole road drawn, every milestone lit, the dot resting at the road's end
        [inHero, inPath, inBridge, inScene].forEach((s) => draw(s, s.length, s === inScene));
        endTag.classList.add('is-on');
        return;
      }
      const vh = innerHeight;

      // 1 · hero: the last stretch of the hero scene draws the line out of the bio and down to the edge
      const heroRect = heroScene.getBoundingClientRect();
      const heroShare = clamp((clamp(-heroRect.top / Math.max(1, heroRect.height - vh)) - HERO_FROM) / (1 - HERO_FROM));

      // 2 · path: as the section comes up the dot climbs from the bottom edge to its riding height, then holds it
      const top = journey.getBoundingClientRect().top;
      const ride = Math.max(DOT_LINE, 1 - (0.5 * (vh - top)) / vh);
      const y = ride * vh - top;
      const height = journey.offsetHeight;
      const along = lengthAt(inPath, clamp(y, 0, height));

      // 3 · bridge: each leg is a share of its own stretch of scroll. Down beside the sentence while the stage
      //     comes up to the top, along under it while the stage is held there, and down to the scene's edge
      //     while the stage leaves; the last leg ends as the scene's edge reaches the dot's riding height.
      const held = bridgeStage.getBoundingClientRect().top;
      const hold = bridge.offsetHeight - bridgeStage.offsetHeight;
      const legShare = [
        clamp(1 - held / (DOT_LINE * vh)),
        hold > 0 ? clamp(-bridge.getBoundingClientRect().top / hold) : +(held <= 0),
        clamp(-held / ((1 - DOT_LINE) * vh))
      ];
      const done = legShare[0] + legShare[1] + legShare[2];
      if (done !== travelled) { travelled = done; bridge.style.setProperty('--p', done.toFixed(4)); }

      // 4 · scene: the road runs on into the stage and stops at the year
      const sceneY = DOT_LINE * vh - stage.getBoundingClientRect().top;

      const past = y >= height; // the dot has left the path section
      draw(inHero, inHero.length * heroShare, heroShare > 0 && y <= 0);
      const at = draw(inPath, along, y > 0 && !past);
      draw(inBridge, legs.reduce((sum, leg, i) => sum + leg * legShare[i], 0), past && done < 3);
      draw(inScene, lengthAt(inScene, clamp(sceneY, 0, end.y)), past && done >= 3);

      let reached = -1;
      marks.forEach((mark, i) => {
        const on = along >= mark - 1;
        stops[i].classList.toggle('is-on', on);
        if (on) reached = i;
      });
      // The caption rides with the dot on the side that is free of the nearest milestone's text.
      // When that side changes it fades out, crosses over unseen, and fades back in.
      let near = 0;
      marks.forEach((mark, i) => { if (Math.abs(mark - along) < Math.abs(marks[near] - along)) near = i; });
      const wantRight = near % 2 === 0;
      const time = performance.now();
      if (wantRight === tagRight) crossAt = 0;
      else if (!crossAt) { crossAt = time + 170; setTimeout(request, 180); }
      if (crossAt && time >= crossAt) { tagRight = wantRight; crossAt = 0; }
      // on a milestone the caption would only repeat the label beside it, so it shows between milestones
      const between = Math.abs(marks[near] - along) > 34;
      tag.classList.toggle('is-on', !!at && reached > -1 && !crossAt && between);
      if (at && reached > -1) {
        if (reached !== caption) { caption = reached; tag.textContent = captions[reached]; }
        tag.style.transform = tagRight
          ? `translate(${at.x + 22}px, ${at.y}px) translate(0, -50%)`
          : `translate(${at.x - 22}px, ${at.y}px) translate(-100%, -50%)`;
      }
      endTag.classList.toggle('is-on', past && sceneY >= end.y - 1);
    };

    const measure = () => {
      const width = html.clientWidth;
      const centre = (node, box) => {
        const at = layoutPos(node, box);
        return { x: at.x + node.offsetWidth / 2, y: at.y + node.offsetHeight / 2 };
      };

      // hero: out of the bio's last line, past the right of the text, then down to the edge of the stage
      const from = centre(start, heroBox);
      const turn = Math.max(from.x + 72, layoutPos(heroText, heroBox).x + heroText.offsetWidth + 44);
      const r = 26;
      shape(inHero, `M${from.x + 12},${from.y} L${turn - r},${from.y} Q${turn},${from.y} ${turn},${from.y + r} L${turn},${heroBox.offsetHeight}`);

      // bridge: straight down beside the sentence, round the corner and along under it, the tangle under its
      // last word, on to the right edge and down to where the scene picks the road up
      const size = parseFloat(getComputedStyle(say).fontSize);
      const text = layoutPos(say, bridgeStage);
      const lane = text.x - 0.34 * size;
      const under = text.y + say.offsetHeight + 0.24 * size;
      const exit = ROAD_IN * width;
      const loose = $('.bridge__loose', say);
      const word = layoutPos(loose, bridgeStage);
      const knot = tangle(word.x, word.x + loose.offsetWidth, under, size);
      shape(inBridge, `M${lane},0 L${lane},${under - r} Q${lane},${under} ${lane + r},${under} L${word.x},${under} ${knot.d} L${exit - r},${under} Q${exit},${under} ${exit},${under + r} L${exit},${bridgeStage.offsetHeight}`);
      legs = [under - r, 0, bridgeStage.offsetHeight - under - r];
      legs[1] = inBridge.length - legs[0] - legs[2];
      // Each word comes up as the dot reaches it (--at, on the same 0 to 3 scale as --p): the first line as the
      // dot passes it on the way down, the second word by word as the dot runs along under it. The last word
      // also turns loose while the tangle under it is drawn (--turn is how fast, so it ends with the tangle).
      const corner = 1.62 * r; // length of the rounded corner
      $$('.line', say).forEach((line, row) => $$('.w', line).forEach((w, i) => {
        const at = row === 0
          ? clamp((layoutPos(line, bridgeStage).y + line.offsetHeight / 2) / legs[0]) - 0.16 + i * 0.05
          : 1 + clamp((corner + layoutPos(w, bridgeStage).x - lane - r) / legs[1]) - 0.012;
        w.style.setProperty('--at', at.toFixed(4));
      }));
      loose.style.setProperty('--turn', (legs[1] / knot.length).toFixed(3));
      // how far it turns: its far end lifts by the same small share of the type size, whatever the word's length
      loose.style.setProperty('--tilt', clamp((Math.asin(clamp((0.13 * size) / loose.offsetWidth)) * 180) / Math.PI, 1, 4).toFixed(2));

      // path: in at the top where the hero's line left, through every milestone, out where the bridge picks it up
      const left = journey.getBoundingClientRect().left;
      const into = lane + bridgeStage.getBoundingClientRect().left;
      const pts = [{ x: turn - left, y: 0 }, ...nodes.map((n) => centre(n, journey)), { x: into - left, y: journey.offsetHeight }];
      shape(inPath, sway(pts));
      marks = nodes.map((n, i) => lengthAt(inPath, pts[i + 1].y));

      // scene: the last stretch down the right side, ending at the year
      end = { x: ROAD_END[0] * stage.clientWidth, y: ROAD_END[1] * stage.clientHeight };
      shape(inScene, sway([{ x: exit, y: 0 }, end]));
      // the year sits up and to the left of the road's end
      endTag.style.transform = `translate(${end.x - 16}px, ${end.y - 16}px) translate(-100%, -100%)`;
      travelled = -1;
      update();
    };

    let sizing = false;
    const resize = () => { if (!sizing) { sizing = true; requestAnimationFrame(() => { sizing = false; measure(); }); } };

    if (motion) journey.classList.add('is-armed');
    measure();
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', resize);
    if ('ResizeObserver' in window) {
      const watch = new ResizeObserver(resize);
      [journey, heroText, say].forEach((n) => watch.observe(n));
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  }

  /* ---------- section motion ---------- */

  function initSections() {
    if (!motion) return;
    const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true });
    $$('[data-rv]').forEach((n) => gsap.from(n, { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', scrollTrigger: once(n) }));
  }

  /* ---------- the three project cards inside the scene ---------- */

  const CARD_TILT = [-4, 2.5, 5];

  function initCards(selectProject) {
    const host = $('#cards');
    const stage = host.closest('.scene__stage');
    const cards = C.work.projects.map((p, i) => {
      const slot = el('div', 'slot');
      const card = el('button', 'card');
      card.type = 'button';
      card.style.setProperty('--pc', p.color);
      const img = el('img', 'card__img');
      img.src = p.thumb;
      img.alt = '';
      img.draggable = false;
      const body = el('span', 'card__body');
      const top = el('span', 'card__top');
      top.append(decor('span', 'card__dot'), write(el('span', 'card__name'), t(p.name)), el('span', 'card__meta', t(p.meta)));
      body.append(top, el('span', 'card__line', t(p.line)), el('span', 'card__open', t(C.how.open)));
      card.append(img, body);
      slot.append(card);
      host.append(slot);

      // A click carries the visitor down to this project's deep dive; a drag that ends on the card does not.
      let down = null;
      card.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
      card.addEventListener('click', (e) => {
        const dragged = down && e.detail > 0 && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6;
        down = null;
        if (!dragged) selectProject(i, { scroll: true, focus: e.detail === 0 });
      });
      return card;
    });

    if (!motion) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1101px)', () => {
      let front = 1;
      cards.forEach((card, i) => gsap.set(card, { rotation: CARD_TILT[i] }));
      const drags = window.Draggable.create(cards, {
        type: 'x,y', bounds: stage, inertia: true, edgeResistance: 0.75, dragClickables: true,
        onPress() {
          this.target.parentNode.style.zIndex = ++front;
          gsap.to(this.target, { scale: 1.03, duration: 0.2 });
        },
        onRelease() { gsap.to(this.target, { scale: 1, duration: 0.3 }); }
      });
      return () => {
        drags.forEach((d) => d.kill());
        gsap.set(cards, { clearProps: 'transform' });
        cards.forEach((card) => { card.parentNode.style.zIndex = ''; });
      };
    });
  }

  /* ---------- work: the visual at the top of a project's stage ---------- */

  // DisciPlan: one square for every planned day, beside the two lines the plan stands on.
  function planVisual(v) {
    const node = el('div', 'plan');
    const days = el('div', 'plan__days');
    const grid = decor('div', 'plan__grid');
    for (let i = 0; i < v.days; i++) grid.append(el('span', 'plan__day'));
    days.append(el('p', 'plan__label', t(v.label)), grid, el('p', 'plan__legend', t(v.legend)));
    const words = el('div', 'plan__words');
    words.append(
      el('p', 'plan__line plan__line--fades', t(v.line1)),
      el('p', 'plan__line plan__line--stays', t(v.line2)),
      decor('span', 'plan__rule'),
      el('p', 'plan__facts', t(v.facts))
    );
    node.append(days, words);
    // the days fill in one after another each time the plan comes up
    const enter = () => gsap.fromTo(grid.children, { opacity: 0.14, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power1.out', stagger: 0.012, overwrite: true });
    return { node, enter };
  }

  // A screen recording. It plays on its own and can be paused; with reduced motion it waits as a still frame.
  function gifVisual(v) {
    const M = C.work.media;
    const node = el('div', 'media');
    node.style.setProperty('--ar', `${v.width} / ${v.height}`);
    const img = el('img', 'media__img');
    img.alt = t(v.alt);
    img.width = v.width;
    img.height = v.height;
    img.decoding = 'async';
    const still = el('canvas', 'media__still');
    still.width = v.width;
    still.height = v.height;
    still.setAttribute('role', 'img');
    still.setAttribute('aria-label', t(v.alt));
    const toggle = el('button', 'media__toggle');
    toggle.type = 'button';

    let playing = !reduce;
    const freeze = () => { if (img.complete && img.naturalWidth) still.getContext('2d').drawImage(img, 0, 0, v.width, v.height); };
    const show = () => {
      img.hidden = !playing;
      still.hidden = playing;
      toggle.dataset.state = playing ? 'playing' : 'paused';
      toggle.setAttribute('aria-label', t(playing ? M.pause : M.play));
    };
    toggle.addEventListener('click', () => {
      if (playing) freeze();
      playing = !playing;
      show();
    });
    img.addEventListener('load', () => { if (!playing) freeze(); }, { once: true });
    img.src = v.src;
    show();
    node.append(img, still, toggle);
    return { node };
  }

  /* ---------- work: index on the left, the selected project on the right ---------- */

  function initDive(openProject) {
    const projects = C.work.projects;
    const index = $('#dive-index');
    const stage = $('#dive-stage');
    const main = $('#dive-main');
    const visual = $('#dive-visual');
    const body = $('#dive-body');
    const readme = $('#dive-readme');
    const story = $('#dive-story');
    const storyOpen = $('#dive-story-open');
    const visuals = [];
    let current = -1;
    let swap = null;
    let seen = !motion; // has the stage been on screen yet

    const tabs = projects.map((p, i) => {
      const tab = el('button', 'dive__tab');
      tab.type = 'button';
      tab.id = 'dive-tab-' + i;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'dive-stage');
      tab.style.setProperty('--pc', p.color);
      tab.append(
        decor('span', 'dive__tab-n'),
        write(el('span', 'dive__tab-name'), t(p.name)),
        el('span', 'dive__tab-date', t(p.meta))
      );
      tab.firstChild.textContent = String(i + 1).padStart(2, '0');
      tab.addEventListener('click', () => select(i));
      index.append(tab);
      return tab;
    });

    const render = (i) => {
      const p = projects[i];
      stage.style.setProperty('--pc', p.color);
      stage.setAttribute('aria-labelledby', tabs[i].id);
      const view = visuals[i] || (visuals[i] = p.visual.type === 'gif' ? gifVisual(p.visual) : planVisual(p.visual));
      visual.replaceChildren(view.node);
      if (motion && seen && view.enter) view.enter();
      write($('#story-title'), t(p.name));
      $('#story-text').replaceChildren(...p.story.map((part) => write(el('p', part.aside ? 'story__aside' : ''), t(part))));
      $('#dive-date').textContent = t(p.meta);
      write($('#dive-name'), t(p.name));
      $('#dive-line').textContent = t(p.line);
      $('#dive-problem').textContent = t(p.problem);
      $('#dive-built').textContent = t(p.built);
      write($('#dive-out'), t(p.out));
      // a tag that names a skill is a button that jumps to that skill; the pill itself looks the same
      $('#dive-tags').replaceChildren(...p.tags.map((tag) => {
        if (!tag.skill) return el('li', 'tag', t(tag));
        const li = el('li', 'tag');
        const button = el('button', 'tag__btn', t(tag));
        button.type = 'button';
        button.dataset.skill = tag.skill;
        button.setAttribute('aria-label', `${t(tag)}: ${t(C.skills.tagHint)}`);
        li.append(button);
        return li;
      }));
    };

    /* --- the story: a layer over the stage, opening out of its button --- */

    const veil = { r: 0 }; // radius of the circle the story is seen through, in px
    let told = false;
    let telling = null;

    function tell(on, { animate = true, refocus = true } = {}) {
      if (on === told) return;
      // the state is set at once; the motion only follows it, so it can be turned around at any moment
      told = on;
      storyOpen.setAttribute('aria-expanded', String(on));
      main.inert = on;
      story.inert = !on;
      if (telling) { telling.kill(); telling = null; }
      if (on) {
        story.hidden = false;
        story.scrollTop = 0;
      }
      const settle = () => {
        story.style.clipPath = '';
        if (!told) story.hidden = true;
      };
      if (motion && animate) {
        const s = stage.getBoundingClientRect();
        const b = storyOpen.getBoundingClientRect();
        const at = { x: b.left + b.width / 2 - s.left, y: b.top + b.height / 2 - s.top };
        const far = Math.hypot(Math.max(at.x, s.width - at.x), Math.max(at.y, s.height - at.y)) + 8;
        const cut = () => { story.style.clipPath = `circle(${veil.r}px at ${at.x}px ${at.y}px)`; };
        cut();
        telling = gsap.timeline({ onComplete: settle });
        // closing takes about two thirds of the time opening does
        telling.to(veil, { r: on ? far : 0, duration: on ? 0.5 : 0.32, ease: on ? 'power2.out' : 'power2.in', onUpdate: cut }, 0);
        if (on) {
          telling.fromTo([$('.story__head', story), ...$('#story-text').children], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.06 }, 0.12);
        }
      } else {
        veil.r = 0;
        settle();
      }
      if (on) story.focus({ preventScroll: true });
      else if (refocus) storyOpen.focus({ preventScroll: true });
    }

    function select(i, { scroll = false, focus = false } = {}) {
      tabs.forEach((tab, k) => {
        tab.setAttribute('aria-selected', String(k === i));
        tab.tabIndex = k === i ? 0 : -1;
      });
      if (i !== current) {
        const first = current === -1;
        current = i;
        tell(false, { animate: false, refocus: false });
        if (swap) swap.kill();
        if (motion && !first) {
          swap = gsap.timeline();
          swap.to([visual, body], { opacity: 0, duration: 0.15, ease: 'power1.in' });
          swap.add(() => render(i));
          swap.to(visual, { opacity: 1, duration: 0.3, ease: 'power1.out' });
          swap.fromTo(body, { y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<');
        } else {
          render(i);
        }
      }
      if (scroll) scrollToNode($('#work'));
      if (focus) tabs[i].focus({ preventScroll: true });
    }

    index.addEventListener('keydown', (e) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      let next = current;
      if (step) next = (current + step + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      select(next, { focus: true });
    });

    readme.addEventListener('click', (e) => {
      const r = readme.getBoundingClientRect();
      const point = e.detail > 0 ? { x: e.clientX, y: e.clientY } : { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      openProject(projects[current], stage, point, readme);
    });

    $('#dive-tags').addEventListener('click', (e) => {
      const button = e.target.closest('.tag__btn');
      if (button) links.toSkill(button.dataset.skill);
    });

    storyOpen.addEventListener('click', () => tell(true));
    $('#dive-story-close').addEventListener('click', () => tell(false));
    stage.addEventListener('keydown', (e) => {
      if (!told || e.key !== 'Escape') return;
      e.preventDefault();
      tell(false);
    });

    // The recordings are fetched when the section comes near, not with the page.
    if ('IntersectionObserver' in window) {
      const near = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        projects.forEach((p) => { if (p.visual.type === 'gif') new Image().src = p.visual.src; });
      }, { rootMargin: '100% 0px' });
      near.observe(stage);
    }
    if (motion) {
      window.ScrollTrigger.create({
        trigger: stage, start: 'top 85%', once: true,
        onEnter: () => {
          seen = true;
          const view = visuals[current];
          if (view && view.enter) view.enter();
        }
      });
    }

    select(0);
    links.toProject = select;
    return select;
  }

  /* ---------- project window ---------- */

  const slug = (text) => text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
  const normPath = (path) => {
    const out = [];
    path.split('/').forEach((seg) => {
      if (seg === '..') out.pop();
      else if (seg && seg !== '.') out.push(seg);
    });
    return out.join('/');
  };
  const isExternal = (url) => /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(url);

  // Every document is read from its repository on GitHub when the window opens: the file itself from the raw host,
  // and the same file on github.com for "View on GitHub".
  const GITHUB = { raw: 'https://raw.githubusercontent.com', web: 'https://github.com' };
  const rawUrl = (p, path) => `${GITHUB.raw}/${p.repo}/${p.branch}/${path}`;
  const webUrl = (p, path) => `${GITHUB.web}/${p.repo}/blob/${p.branch}/${path}`;

  // Diagrams written in a document (a "mermaid" code block) are drawn the way GitHub draws them. The library is a
  // pinned version, and it is only fetched once a document that contains such a block has been opened.
  const MERMAID = 'https://cdn.jsdelivr.net/npm/mermaid@11.17.2/dist/mermaid.esm.min.mjs';
  let mermaidLib = null;
  const loadMermaid = () => {
    if (!mermaidLib) mermaidLib = import(MERMAID).then((mod) => mod.default).catch((err) => { mermaidLib = null; throw err; });
    return mermaidLib;
  };
  const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  // `share` of colour a over colour b, as a hex colour (the diagram library takes plain colours only)
  const blend = (a, b, share) => '#' + rgbOf(a).map((v, i) => Math.round(v * share + rgbOf(b)[i] * (1 - share)).toString(16).padStart(2, '0')).join('');

  function initWindow() {
    const root = $('#pw');
    const flood = $('.pw__flood', root);
    const backdrop = $('.pw__backdrop', root);
    const win = $('.pw__win', root);
    const body = $('#pw-body');
    const docHost = $('#pw-doc');
    const tabs = $('#pw-tabs');
    const github = $('#pw-github');
    const dock = $('#dock');
    const behind = [$('.nav'), $('#main'), $('.footer')];
    github.setAttribute('aria-label', `${t(C.window.github)} (${t(C.window.newTab)})`);

    let state = 'closed'; // closed | open | min
    let project = null;
    let source = null; // the element the window grows out of and returns to
    let opener = null; // the control that gets focus back
    let origin = { x: 0, y: 0 };
    let docIndex = 0;
    let tl = null;
    const cache = new Map();

    const lock = (on) => {
      behind.forEach((n) => { n.inert = on; });
      html.classList.toggle('is-locked', on);
      if (lenis) on ? lenis.stop() : lenis.start();
    };
    const finish = () => { if (tl) { const old = tl; tl = null; old.progress(1); } };
    const circle = (radius, pt) => `circle(${radius}px at ${pt.x}px ${pt.y}px)`;
    const reach = (pt) => Math.hypot(Math.max(pt.x, innerWidth - pt.x), Math.max(pt.y, innerHeight - pt.y)) + 8;
    const centerOf = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    const onScreen = (r) => r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;

    // FLIP: the window is laid out at its final rect and animated from/to another rect.
    const rectVars = (from) => {
      const r = win.getBoundingClientRect();
      return { x: from.left - r.left, y: from.top - r.top, scaleX: from.width / r.width, scaleY: from.height / r.height, transformOrigin: '0 0' };
    };
    const growFrom = (from, vars) => gsap.fromTo(win, rectVars(from), { x: 0, y: 0, scaleX: 1, scaleY: 1, ...vars });

    /* --- documents --- */

    const reveal = reduce || !('IntersectionObserver' in window) ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        reveal.unobserve(entry.target);
      });
    }, { root: body, rootMargin: '0px 0px -6% 0px' });

    const findAnchor = (node, id) => id && (node.querySelector(`[id="${CSS.escape(id)}"]`) || node.querySelector(`a[name="${CSS.escape(id)}"]`));

    // The document arrives over the network, so it is cleaned before it reaches the page:
    // nothing that runs, no inline handlers or styles, no script URLs.
    function clean(node) {
      $$('script, style, link, meta, base, iframe, frame, object, embed, form, input, button, select, textarea, template, noscript', node).forEach((n) => n.remove());
      $$('*', node).forEach((n) => {
        Array.from(n.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const picture = name === 'src' && n.tagName === 'IMG' && /^\s*data:image\//i.test(attr.value);
          const scripted = /^(href|src|xlink:href|action|formaction)$/.test(name) && /^\s*(javascript|vbscript|data):/i.test(attr.value) && !picture;
          if (name.startsWith('on') || name === 'style' || name === 'srcdoc' || scripted) n.removeAttribute(attr.name);
        });
      });
    }

    function prepareDoc(node, p, index) {
      const dir = p.docs[index].file.replace(/[^/]*$/, '');
      clean(node);

      // pictures that sit beside the document in the repository are read from the repository too
      $$('img', node).forEach((img) => {
        const src = img.getAttribute('src') || '';
        if (src && !isExternal(src) && !src.startsWith('data:')) img.setAttribute('src', rawUrl(p, normPath(src.startsWith('/') ? src : dir + src)));
        img.decoding = 'async';
      });

      const used = new Set();
      $$('h1, h2, h3, h4, h5, h6', node).forEach((h) => {
        if (h.id) return;
        const base = slug(h.textContent);
        let id = base;
        for (let n = 1; used.has(id); n++) id = `${base}-${n}`;
        used.add(id);
        h.id = id;
      });

      // In-README anchors scroll inside the window, links to another tab switch tabs, everything else becomes plain text.
      $$('a[href]', node).forEach((a) => {
        const href = a.getAttribute('href');
        if (a.closest('summary')) {
          // a summary toggles its section; a link inside it would swallow that
        } else if (href.startsWith('#')) {
          const id = decodeURIComponent(href.slice(1));
          if (findAnchor(node, id)) { a.dataset.anchor = id; return; }
        } else if (!isExternal(href)) {
          const [path, hash = ''] = href.split('#');
          const tab = p.docs.findIndex((d) => d.file === normPath(dir + path));
          if (tab > -1) {
            a.setAttribute('href', '#' + hash);
            a.dataset.tab = tab;
            a.dataset.anchor = decodeURIComponent(hash);
            return;
          }
        }
        const plain = el('span', 'md-plain');
        plain.append(...a.childNodes);
        a.replaceWith(plain);
      });

      $$('table', node).forEach((table) => {
        const box = el('div', 'md-table');
        table.replaceWith(box);
        box.append(table);
      });
    }

    // Draws every diagram block of a document in place. Colours are set for the dark window, with the project's
    // colour as the accent. The library runs in its strict mode: a diagram's text is sanitised and it cannot run
    // script. A block that cannot be drawn stays as it is, with one line and the way to the document on GitHub.
    const DIAGRAM_MIN = 0.74; // smallest scale a drawing is shown at: its 15px text is then still about 11px
    let diagrams = 0;
    async function drawDiagrams(node, p, file) {
      const blocks = $$('pre > code.language-mermaid', node);
      if (!blocks.length) return;
      const paper = '#0B0B0E';
      let mermaid = null;
      try {
        mermaid = await loadMermaid();
        mermaid.initialize({
          startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, theme: 'base',
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
          flowchart: { useMaxWidth: false, htmlLabels: true, nodeSpacing: 34, rankSpacing: 42 },
          themeVariables: {
            darkMode: true, background: paper, fontSize: '15px',
            primaryColor: blend(p.color, '#18181B', 0.2), primaryTextColor: '#FAFAFA', primaryBorderColor: blend(p.color, '#FFFFFF', 0.6),
            secondaryColor: '#18181B', secondaryTextColor: '#FAFAFA', secondaryBorderColor: '#52525B',
            tertiaryColor: blend(p.color, paper, 0.08), tertiaryTextColor: '#E4E4E7', tertiaryBorderColor: blend(p.color, paper, 0.6),
            lineColor: '#A1A1AA', textColor: '#E4E4E7', titleColor: '#FAFAFA',
            clusterBkg: blend(p.color, paper, 0.08), clusterBorder: blend(p.color, paper, 0.6),
            edgeLabelBackground: paper
          }
        });
      } catch (err) { mermaid = null; }

      for (const code of blocks) {
        const pre = code.parentNode;
        const id = 'pw-diagram-' + (++diagrams);
        try {
          if (!mermaid) throw new Error('diagram library not available');
          const { svg } = await mermaid.render(id, code.textContent);
          const figure = el('figure', 'md-diagram');
          figure.setAttribute('aria-label', t(C.window.diagram));
          figure.innerHTML = svg;
          pre.replaceWith(figure);
          // The drawing is shown at its own size where there is room and scaled down to the frame's width where
          // there is not, but never below the scale at which its text is still about 11px: past that it keeps
          // that size and scrolls sideways inside its frame, which is then reachable by keyboard.
          const drawing = $('svg', figure);
          const natural = parseFloat(drawing.getAttribute('width')) || drawing.viewBox.baseVal.width;
          const fit = () => {
            const room = figure.clientWidth - 40;
            const scale = Math.max(DIAGRAM_MIN, Math.min(1, room / natural));
            drawing.style.width = Math.round(natural * scale) + 'px';
            if (figure.scrollWidth > figure.clientWidth + 1) figure.tabIndex = 0;
            else figure.removeAttribute('tabindex');
          };
          fit();
          if ('ResizeObserver' in window) new ResizeObserver(fit).observe(figure);
        } catch (err) {
          $$(`#${id}, #d${id}`).forEach((n) => n.remove()); // whatever the failed attempt left behind
          const link = el('a', '', `${t(C.window.github)} ↗`);
          link.href = webUrl(p, file);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `${t(C.window.github)} (${t(C.window.newTab)})`);
          const note = el('p', 'md-diagram-note', t(C.window.diagramError) + ' ');
          note.append(link);
          pre.after(note);
        }
      }
    }

    function loadDoc(p, index) {
      const key = `${p.id}:${index}`;
      if (cache.has(key)) return cache.get(key);
      const file = p.docs[index].file;
      const node = el('div', 'md');
      const status = el('p', 'md-status', t(C.window.loading));
      status.setAttribute('role', 'status');
      node.append(status);
      const entry = { node, ready: null };
      entry.ready = fetch(rawUrl(p, file))
        .then((res) => { if (!res.ok) throw new Error(`doc ${res.status}`); return res.text(); })
        .then((md) => {
          // Parsed into a document of its own first: nothing in it loads or runs before it has been cleaned.
          const page = new DOMParser().parseFromString(window.marked.parse(md, { gfm: true }), 'text/html').body;
          prepareDoc(page, p, index);
          node.replaceChildren(...page.childNodes);
          if (reveal) Array.from(node.children).forEach((child) => { child.classList.add('rv'); reveal.observe(child); });
          drawDiagrams(node, p, file);
        })
        .catch(() => {
          // Not reachable (a private repository, no network): one line and the way to the document on GitHub.
          cache.delete(key);
          const link = el('a', '', `${t(C.window.github)} ↗`);
          link.href = webUrl(p, file);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.setAttribute('aria-label', `${t(C.window.github)} (${t(C.window.newTab)})`);
          const more = el('p', 'md-status md-status--link');
          more.append(link);
          status.classList.add('md-status--note');
          status.textContent = t(C.window.error);
          node.replaceChildren(status, more);
        });
      cache.set(key, entry);
      return entry;
    }

    function scrollToAnchor(node, id) {
      const target = findAnchor(node, id);
      if (!target) return;
      const top = target.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop - 16;
      body.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    }

    function showDoc(index, anchor) {
      docIndex = index;
      $$('.pw__tab', tabs).forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
        if (i === index) docHost.setAttribute('aria-labelledby', tab.id);
      });
      if (!project.docs[1]) docHost.removeAttribute('aria-labelledby');
      github.href = webUrl(project, project.docs[index].file);
      const shown = project;
      const entry = loadDoc(shown, index);
      docHost.replaceChildren(entry.node);
      body.scrollTop = 0;
      if (anchor) entry.ready.then(() => { if (project === shown && docIndex === index) scrollToAnchor(entry.node, anchor); });
    }

    function buildTabs(p) {
      tabs.replaceChildren();
      const tabbed = p.docs.length > 1;
      tabs.hidden = !tabbed;
      if (tabbed) docHost.setAttribute('role', 'tabpanel');
      else docHost.removeAttribute('role');
      if (!tabbed) return;
      p.docs.forEach((doc, i) => {
        const tab = el('button', 'pw__tab', t(doc.label));
        tab.type = 'button';
        tab.id = 'pw-tab-' + i;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', 'pw-doc');
        tab.dataset.index = i;
        tabs.append(tab);
      });
    }

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.pw__tab');
      if (tab) showDoc(Number(tab.dataset.index));
    });
    tabs.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const all = $$('.pw__tab', tabs);
      const next = (docIndex + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length;
      showDoc(next);
      all[next].focus();
    });

    docHost.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-anchor]');
      if (!a) return;
      e.preventDefault();
      if (a.dataset.tab != null && Number(a.dataset.tab) !== docIndex) showDoc(Number(a.dataset.tab), a.dataset.anchor);
      else if (a.dataset.anchor) scrollToAnchor(a.closest('.md'), a.dataset.anchor);
      else body.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    /* --- open / close / minimize / full screen --- */

    function reset(refocus) {
      finish();
      const back = opener;
      state = 'closed';
      project = null;
      source = null;
      opener = null;
      root.hidden = true;
      dock.hidden = true;
      win.classList.remove('is-full');
      docHost.replaceChildren();
      if (gsap) gsap.set([win, flood, backdrop, dock], { clearProps: 'all' });
      lock(false);
      if (refocus && back) back.focus({ preventScroll: true });
    }

    function open(p, from, point, focusBack) {
      if (state !== 'closed') reset(false);
      state = 'open';
      project = p;
      source = from;
      opener = focusBack || from;
      origin = point;
      root.style.setProperty('--pc', p.color);
      dock.style.setProperty('--pc', p.color);
      write($('#pw-title'), t(p.name));
      $('#pw-note').textContent = t(p.note);
      write($('#dock-name'), t(p.name));
      dock.setAttribute('aria-label', `${t(C.window.restore)} ${t(p.name)}`);
      buildTabs(p);
      showDoc(0);
      root.hidden = false;
      lock(true);
      win.focus({ preventScroll: true });
      if (!motion) return;

      const start = from.getBoundingClientRect();
      gsap.set(win, { opacity: 0 }); // opacity, not visibility: the window keeps keyboard focus while the colour floods
      gsap.set(backdrop, { opacity: 0 });
      gsap.set(flood, { opacity: 1, clipPath: circle(0, point) });
      tl = gsap.timeline();
      tl.to(flood, { clipPath: circle(reach(point), point), duration: 0.55, ease: 'power2.inOut' });
      tl.addLabel('grow');
      tl.set(win, { opacity: 1 }, 'grow');
      if (phone.matches) tl.fromTo(win, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'expo.out' }, 'grow');
      else tl.add(growFrom(start, { duration: 0.65, ease: 'expo.out' }), 'grow');
      tl.to(backdrop, { opacity: 0.94, duration: 0.5, ease: 'power1.out' }, 'grow');
      tl.to(flood, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 'grow');
    }

    function close() {
      if (state === 'closed') return;
      if (state === 'min' || !motion) { reset(state === 'open'); return; }
      finish();
      const rect = source.getBoundingClientRect();
      const home = onScreen(rect);
      const pt = home ? centerOf(rect) : origin;
      gsap.set(flood, { clipPath: circle(reach(pt), pt) });
      tl = gsap.timeline({ onComplete: () => reset(true) });
      tl.to(flood, { opacity: 1, duration: 0.25, ease: 'power1.in' }, 0);
      tl.to(backdrop, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0.1);
      if (phone.matches) tl.to(win, { yPercent: 100, duration: 0.4, ease: 'power3.in' }, 0);
      else if (home) tl.to(win, { ...rectVars(rect), autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, 0);
      else tl.to(win, { scale: 0.94, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 0);
      tl.to(flood, { clipPath: circle(0, pt), duration: 0.45, ease: 'power2.inOut' }, '>-0.08');
    }

    function minimize() {
      if (state !== 'open') return;
      finish();
      state = 'min';
      dock.hidden = false;
      const done = () => { root.hidden = true; lock(false); dock.focus({ preventScroll: true }); };
      if (!motion) { done(); return; }
      gsap.set(dock, { autoAlpha: 0 });
      tl = gsap.timeline({ onComplete: done });
      tl.to(win, { ...rectVars(dock.getBoundingClientRect()), autoAlpha: 0, duration: 0.45, ease: 'power3.inOut' }, 0);
      tl.to(backdrop, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0);
      tl.to(dock, { autoAlpha: 1, duration: 0.25 }, 0.3);
    }

    function restore() {
      if (state !== 'min') return;
      finish();
      state = 'open';
      const from = dock.getBoundingClientRect();
      dock.hidden = true;
      root.hidden = false;
      lock(true);
      if (motion) gsap.set(win, { clearProps: 'transform', autoAlpha: 1 });
      win.focus({ preventScroll: true });
      if (!motion) return;
      tl = gsap.timeline();
      tl.add(growFrom(from, { duration: 0.55, ease: 'expo.out' }), 0);
      tl.fromTo(win, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0);
      tl.to(backdrop, { opacity: 0.94, duration: 0.4 }, 0);
    }

    function toggleFull() {
      if (state !== 'open' || phone.matches) return;
      finish();
      const before = win.getBoundingClientRect();
      win.classList.toggle('is-full');
      if (motion) tl = gsap.timeline().add(growFrom(before, { duration: 0.4, ease: 'power3.out' }));
    }

    const actions = { close, min: minimize, full: toggleFull };
    $('.pw__lights', root).addEventListener('click', (e) => {
      const btn = e.target.closest('[data-pw]');
      if (btn) actions[btn.dataset.pw]();
    });
    backdrop.addEventListener('click', close);
    dock.addEventListener('click', restore);

    document.addEventListener('keydown', (e) => {
      if (state !== 'open') return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      // Keeps focus inside the window while it is open.
      const items = $$('button, a[href], summary, [tabindex="0"]', win).filter((n) => n.getClientRects().length > 0);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === win)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    });

    return open;
  }

  /* ---------- start ---------- */

  fillText();
  initLang();
  buildName();
  buildBio();
  buildJourney();
  buildBridge();
  fitHeroFrame();
  buildHow();
  buildContact();
  initScroll();
  initCards(initDive(initWindow()));
  initSkills();
  initScenes();
  initRoad();
  initSections();
  restorePlace();
})();
