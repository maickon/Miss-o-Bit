/* =========================================================
   Missão Bit — lógica do app (HTML + CSS + JS puros)
   ========================================================= */
(function () {
  'use strict';

  /* ---------------- Utilidades ---------------- */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const eq = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('mbit:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('mbit:' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  };
  const session = {
    get(k) { try { return sessionStorage.getItem('mbit:' + k); } catch (e) { return null; } },
    set(k, v) { try { if (v === null) sessionStorage.removeItem('mbit:' + k); else sessionStorage.setItem('mbit:' + k, v); } catch (e) { /* ok */ } }
  };
  const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  /* ---------------- Mascote Bit (SVG) ---------------- */
  function bitSVG(mood = 'happy', cls = '') {
    const mouth = mood === 'sad' ? '<path d="M47 74 Q60 64 73 74" stroke="#8CF5CF" stroke-width="4" fill="none" stroke-linecap="round"/>'
      : mood === 'wow' ? '<circle cx="60" cy="70" r="6" fill="#8CF5CF"/>'
      : '<path d="M47 67 Q60 78 73 67" stroke="#8CF5CF" stroke-width="4" fill="none" stroke-linecap="round"/>';
    const eyes = mood === 'sad'
      ? '<path d="M40 52 l10 8 M50 52 l-10 8 M70 52 l10 8 M80 52 l-10 8" stroke="#8CF5CF" stroke-width="4" stroke-linecap="round"/>'
      : '<circle cx="46" cy="55" r="7" fill="#8CF5CF"/><circle cx="74" cy="55" r="7" fill="#8CF5CF"/><circle cx="48" cy="53" r="2.2" fill="#fff"/><circle cx="76" cy="53" r="2.2" fill="#fff"/>';
    return `<svg class="${cls}" viewBox="0 0 120 130" aria-hidden="true">
      <line x1="60" y1="10" x2="60" y2="26" stroke="#15213B" stroke-width="4" stroke-linecap="round"/>
      <circle cx="60" cy="10" r="7" fill="#FF6A2B" stroke="#15213B" stroke-width="3"/>
      <rect x="4" y="46" width="13" height="24" rx="5" fill="#2F6FEB" stroke="#15213B" stroke-width="3"/>
      <rect x="103" y="46" width="13" height="24" rx="5" fill="#2F6FEB" stroke="#15213B" stroke-width="3"/>
      <rect x="14" y="24" width="92" height="70" rx="20" fill="#FFB547" stroke="#15213B" stroke-width="4"/>
      <rect x="26" y="36" width="68" height="46" rx="12" fill="#15213B"/>
      ${eyes}${mouth}
      <rect x="34" y="98" width="52" height="27" rx="10" fill="#2F6FEB" stroke="#15213B" stroke-width="4"/>
      <circle cx="60" cy="111.5" r="5" fill="#FFD43B"/>
    </svg>`;
  }

  /* ---------------- Som ---------------- */
  let soundOn = store.get('sound', true);
  let actx = null;
  function tone(freq, dur = 0.12, type = 'square', when = 0, vol = 0.06) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      const t0 = actx.currentTime + when;
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* sem áudio */ }
  }
  const sfx = {
    place: () => tone(660, 0.07, 'triangle'),
    step: () => tone(440, 0.06, 'square', 0, 0.035),
    good: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.14, 'triangle', i * 0.1, 0.07)),
    bad: () => { tone(180, 0.25, 'sawtooth', 0, 0.05); tone(120, 0.3, 'sawtooth', 0.18, 0.05); },
    right: () => { tone(784, 0.1, 'triangle'); tone(1046, 0.16, 'triangle', 0.09); },
    wrong: () => tone(160, 0.22, 'sawtooth', 0, 0.045)
  };

  function confetti(n = 60) {
    if (reduceMotion()) return;
    const colors = ['#2F6FEB', '#E9A800', '#17975A', '#E0443F', '#8B4FD1', '#FF6A2B'];
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      d.style.left = Math.random() * 100 + 'vw';
      d.style.background = pick(colors);
      d.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      d.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 3800);
    }
  }

  /* ---------------- Cartas (HTML) ---------------- */
  function taskOf(cid) { const t = CARDS[cid].task; return t ? TASKS.find(x => x.id === t) : null; }
  function cardHTML(cid, { tag = 'div', mini = false, attrs = '' } = {}) {
    const c = CARDS[cid];
    const t = taskOf(cid);
    return `<${tag} class="card k-${c.kind}${mini ? ' mini' : ''}" ${attrs}>
      <span class="c-head"><span>${KINDS[c.kind].label}</span>${t ? `<span class="t-ico" title="${esc(t.title)}">${t.icon}</span>` : ''}</span>
      <span class="c-ico">${c.icon}</span>
      <span class="c-text">${esc(c.text)}</span>
      <span class="c-code">${esc(c.code)}</span>
    </${tag}>`;
  }

  /* ---------------- Estado do jogo ---------------- */
  const PLAYER_COLORS = ['#FF6A2B', '#2F6FEB', '#17975A', '#8B4FD1', '#E0443F', '#0E9693', '#E9A800', '#D9468F', '#5B6B8C', '#7A5C2E'];
  const G = {
    players: store.get('players', 4),
    checkEach: store.get('checkEach', false),
    hints: store.get('hints', true),
    stars: store.get('stars', {}),
    task: null, slots: [], pool: [], turn: 0, running: false, world: null
  };

  /* ---------------- Interpretador: missões de sequência ---------------- */
  function seqFirstError(task, prog) {
    for (let i = 0; i < prog.length; i++) {
      if (prog[i] == null) return -1;
      const ok = task.solutions.some(sol => prog.slice(0, i + 1).every((c, j) => sol[j] === c));
      if (!ok) return i;
    }
    return -1;
  }
  function errorMessage(task, cid) {
    const c = CARDS[cid];
    if (c.bug) return c.bug;
    if (cid === 'coringa') return 'O Computador não conhece essa instrução inventada... ainda! ⭐';
    const inTask = task.solutions.some(s => s.includes(cid));
    if (!inTask) return `A carta "${c.text}" é de outra missão! 🤔`;
    return c.wrong || `"${c.text}" veio na hora errada!`;
  }
  function runSeq(task, prog, world) {
    const err = seqFirstError(task, prog);
    const upto = err === -1 ? prog.length : err;
    const vars = { A: null, B: null, TOTAL: null };
    const steps = [];
    let skip = false, lastIf = null;
    for (let i = 0; i < upto; i++) {
      const cid = prog[i], c = CARDS[cid];
      if (cid === 'senao') {
        skip = !!lastIf;
        steps.push({ line: i, text: lastIf ? '↪️ SENÃO → o SE já foi SIM, então pula o próximo' : '↪️ SENÃO → o SE foi NÃO, então faz o próximo' });
        continue;
      }
      if (c.kind === 'se') {
        const v = c.cond(world); lastIf = v; skip = !v;
        steps.push({ line: i, text: `❓ ${c.q} → ${v ? 'SIM ✅' : 'NÃO ❌'}` });
        continue;
      }
      if (skip) { steps.push({ line: i, skipped: true, text: `⏭️ Pulou: ${c.text}` }); skip = false; continue; }
      if (c.op) c.op(vars);
      const say = typeof c.say === 'function' ? c.say(c.kind === 'caixa' || cid === 'var_show' ? vars : world) : c.say;
      steps.push({ line: i, text: `${c.icon} ${say}`, vars: { ...vars } });
    }
    return {
      steps,
      error: err === -1 ? null : { line: err, msg: errorMessage(task, prog[err]) },
      vars
    };
  }

  /* ---------------- Interpretador: missões do robô ---------------- */
  function runRobot(task, prog, world, partial = false) {
    const g = task.grid;
    const st = { pos: [...g.start], facing: [0, 1], rock: world.rock && g.rockAt ? [...g.rockAt] : null, knocked: false };
    const walls = g.walls || [];
    const steps = [];
    const snap = () => ({ pos: [...st.pos], rock: st.rock ? [...st.rock] : null });
    const front = () => [st.pos[0] + st.facing[0], st.pos[1] + st.facing[1]];
    const fail = (line, msg, crashAt) => ({ steps, error: { line, msg, crashAt }, state: st });

    function exec(idx) { // devolve uma mensagem de erro ou null
      const cid = prog[idx], c = CARDS[cid];
      if (c.kind === 'mover') {
        const np = [st.pos[0] + c.dir[0], st.pos[1] + c.dir[1]];
        st.facing = c.dir;
        if (np[0] < 0 || np[1] < 0 || np[0] >= g.rows || np[1] >= g.cols) return { msg: 'Bit andou para fora do mapa e caiu! 😱', crashAt: null };
        if (walls.some(w => eq(w, np))) return { msg: 'BUM! Bit bateu na parede! 🧱', crashAt: np };
        if (st.rock && eq(st.rock, np)) return { msg: 'BUM! Bit trombou na pedra! Precisava tirar a pedra antes.', crashAt: np };
        st.pos = np;
        steps.push({ line: idx, text: `${c.icon} Bit andou ${c.word}.`, ...snap() });
        return null;
      }
      if (cid === 'rb_tirar') {
        if (st.rock && eq(st.rock, front())) { st.rock = null; steps.push({ line: idx, text: '💪 Bit tirou a pedra do caminho!', ...snap() }); return null; }
        return { msg: 'Não tem pedra na frente! Bit tentou tirar... o ar. 🤷' };
      }
      if (cid === 'rb_bater') {
        if (task.needKnock && eq(st.pos, g.goal)) { st.knocked = true; steps.push({ line: idx, text: '✊ TOC TOC TOC!', ...snap() }); return null; }
        return { msg: 'Bit bateu no ar! A porta ainda está longe. ✊' };
      }
      if (cid === 'coringa') { steps.push({ line: idx, text: '⭐ Instrução inventada! (o professor decide o que acontece)', ...snap() }); return null; }
      if (c.kind === 'se' || c.kind === 'repita') return { msg: `Depois de "${c.text}" precisa vir uma ação, não outra carta ${KINDS[c.kind].label}.` };
      return { msg: errorMessage(task, cid) };
    }

    let lastIf = null;
    for (let i = 0; i < prog.length; i++) {
      const cid = prog[i]; if (cid == null) break;
      const c = CARDS[cid];
      const hasNext = i + 1 < prog.length && prog[i + 1] != null;
      if (c.kind === 'se') {
        let doIt;
        if (cid === 'senao') {
          if (lastIf === null) return fail(i, 'O SENÃO precisa de um SE antes dele!');
          doIt = !lastIf; lastIf = null;
          if (!hasNext) { if (partial) break; return fail(i, 'O SENÃO precisa de uma ação depois dele.'); }
          steps.push({ line: i, text: doIt ? '↪️ SENÃO → faz o próximo' : '↪️ SENÃO → pula o próximo', ...snap() });
        } else {
          if (cid !== 'se_pedra') return fail(i, errorMessage(task, cid));
          const v = !!(st.rock && eq(st.rock, front()));
          lastIf = v; doIt = v;
          if (!hasNext) { if (partial) break; return fail(i, 'O SE precisa de uma ação depois dele.'); }
          steps.push({ line: i, text: `❓ ${c.q} → ${v ? 'SIM ✅' : 'NÃO ❌'}`, ...snap() });
        }
        if (doIt) { const e = exec(i + 1); if (e) return fail(i + 1, e.msg, e.crashAt); }
        else steps.push({ line: i + 1, skipped: true, text: `⏭️ Pulou: ${CARDS[prog[i + 1]].text}`, ...snap() });
        i++; continue;
      }
      if (c.kind === 'repita') {
        if (!hasNext) { if (partial) break; return fail(i, 'O REPITA precisa de uma ação depois dele.'); }
        steps.push({ line: i, text: `🔁 Repetir ${c.times} vezes:`, ...snap() });
        for (let k = 0; k < c.times; k++) { const e = exec(i + 1); if (e) return fail(i + 1, e.msg, e.crashAt); }
        i++; continue;
      }
      const e = exec(i); if (e) return fail(i, e.msg, e.crashAt);
    }
    if (!partial) {
      const last = prog.length - 1;
      if (!eq(st.pos, g.goal)) return fail(last, g.door ? 'O programa acabou, mas Bit não chegou na porta! 🚪' : 'O programa acabou, mas Bit não chegou na bateria! 🪫');
      if (task.needKnock && !st.knocked) return fail(last, 'Bit chegou na porta, mas não bateu. Ninguém abriu! 🚪');
    }
    return { steps, error: null, state: st };
  }

  function runTask(task, prog, world, partial = false) {
    if (task.type === 'robot') return runRobot(task, prog, world, partial);
    const r = runSeq(task, prog.filter(x => x != null), world);
    return r;
  }

  /* ---------------- Navegação ---------------- */
  const VIEWS = ['inicio', 'missoes', 'jogo', 'estudar', 'professor'];
  function go(v) { if (location.hash.slice(1) === v) route(); else location.hash = v; }
  function route() {
    let v = location.hash.slice(1) || 'inicio';
    if (!VIEWS.includes(v)) v = 'inicio';
    if (v === 'jogo' && !G.task) v = 'missoes';
    VIEWS.forEach(x => { $('#v-' + x).hidden = x !== v; });
    $$('.nav button').forEach(b => {
      const cur = b.dataset.go === v || (v === 'jogo' && b.dataset.go === 'missoes');
      if (cur) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    ({ inicio: renderHome, missoes: renderMissions, jogo: renderPlay, estudar: renderStudy, professor: renderAdmin })[v]();
    window.scrollTo(0, 0);
  }

  /* ---------------- Início ---------------- */
  function renderHome() {
    $('#v-inicio').innerHTML = `
      <div class="hero">
        <div>
          <h1>Missão <span>Bit</span></h1>
          <p class="lead">Um jogo de cartas em que a turma monta o programa do robô Bit, carta por carta. Depois o Computador roda tudo exatamente como foi mandado.</p>
          <div class="menu">
            <button class="menu-item" data-go="missoes"><span class="mi-ico">🎮</span><b>Jogar</b><span>7 missões com o robô Bit</span></button>
            <button class="menu-item" data-go="estudar"><span class="mi-ico">🧠</span><b>Estudar</b><span>Quiz de lógica de programação</span></button>
            <button class="menu-item" data-go="professor"><span class="mi-ico">🖨️</span><b>Professor</b><span>Imprimir as cartas (com senha)</span></button>
          </div>
        </div>
        <div class="hero-art">
          ${bitSVG('happy', 'big-bit')}
        </div>
      </div>
      <div class="legend" aria-label="Cores das cartas">
        <span class="chip k-acao"><i class="dot"></i>Azul: AÇÃO e MOVER</span>
        <span class="chip k-caixa"><i class="dot"></i>Amarela: CAIXA (variável)</span>
        <span class="chip k-se"><i class="dot"></i>Verde: SE (condição)</span>
        <span class="chip k-repita"><i class="dot"></i>Vermelha: REPITA</span>
        <span class="chip k-surpresa"><i class="dot"></i>Surpresa: sorteada ao rodar</span>
      </div>
      <div class="howto">
        <h2>Como jogar</h2>
        <ol>
          <li>O professor revela uma <b>missão</b>. Ela mostra quantas cartas o programa precisa.</li>
          <li>As cartas ficam <b>abertas na mesa</b>. Na sua vez, cada jogador coloca <b>uma carta</b> no próximo espaço do programa.</li>
          <li>Não tem a carta certa? Peça ajuda a um colega para jogar por você.</li>
          <li>Antes de rodar, todos votam: 👍 está certo ou 👎 tem bug?</li>
          <li>O professor é o <b>Computador</b>: roda o programa e faz <b>exatamente</b> o que as cartas mandam.</li>
          <li>Deu bug? O Computador para na linha do erro. Quem achar o bug conserta! Bug não tira ponto.</li>
        </ol>
      </div>`;
  }

  /* ---------------- Lista de missões ---------------- */
  function renderMissions() {
    $('#v-missoes').innerHTML = `
      <div class="page-head">
        <div>
          <h1>Escolha a missão</h1>
          <p>Cada missão ensina um conceito. Siga a ordem: algoritmo, variável, condição e repetição.</p>
        </div>
        <div class="settings">
          <span class="stepper" aria-label="Número de jogadores">👥 Jogadores
            <button id="pl-minus" aria-label="Menos jogadores">−</button><span id="pl-n">${G.players}</span><button id="pl-plus" aria-label="Mais jogadores">+</button>
          </span>
          <label class="toggle"><input type="checkbox" id="opt-hints" ${G.hints ? 'checked' : ''}> Dicas de cor</label>
          <label class="toggle"><input type="checkbox" id="opt-check" ${G.checkEach ? 'checked' : ''}> Conferir a cada carta</label>
        </div>
      </div>
      <div class="missions">
        ${TASKS.map(t => `
          <button class="mission" data-task="${t.id}">
            <span class="m-top"><span class="m-num">MISSÃO ${t.n}</span><span class="m-star" title="${G.stars[t.id] ? 'Concluída' : 'Ainda não concluída'}">${G.stars[t.id] ? '⭐' : '☆'}</span></span>
            <span class="m-ico">${t.icon}</span>
            <h3>${esc(t.title)}</h3>
            <span class="tag k-${t.ckind}">${t.concept}</span>
            <p>${esc(t.story)}</p>
          </button>`).join('')}
      </div>`;
    $('#pl-minus').onclick = () => { G.players = Math.max(1, G.players - 1); store.set('players', G.players); $('#pl-n').textContent = G.players; };
    $('#pl-plus').onclick = () => { G.players = Math.min(10, G.players + 1); store.set('players', G.players); $('#pl-n').textContent = G.players; };
    $('#opt-hints').onchange = e => { G.hints = e.target.checked; store.set('hints', G.hints); };
    $('#opt-check').onchange = e => { G.checkEach = e.target.checked; store.set('checkEach', G.checkEach); };
    $$('.mission').forEach(b => { b.onclick = () => startTask(b.dataset.task); });
  }

  function startTask(id) {
    const t = TASKS.find(x => x.id === id);
    G.task = t;
    const n = t.slots || t.solutions[0].length;
    G.slots = Array(n).fill(null);
    G.pool = shuffle(t.pool.map((cid, i) => ({ uid: i, cid, used: false })));
    G.turn = 0; G.running = false; G.world = null; G.result = null;
    go('jogo');
  }

  /* ---------------- Tela de jogo ---------------- */
  function playerName(i) { return `Jogador ${(i % G.players) + 1}`; }
  function playerColor(i) { return PLAYER_COLORS[i % G.players % PLAYER_COLORS.length]; }

  function renderPlay() {
    const t = G.task;
    $('#v-jogo').innerHTML = `
      <div class="play-head">
        <button class="btn small ghost" data-go="missoes">← Missões</button>
        <span class="tag k-${t.ckind}">Missão ${t.n} · ${t.concept}</span>
        <h1>${t.icon} ${esc(t.title)}</h1>
        <span class="turn" id="turn"></span>
      </div>
      <div class="play-grid">
        <div class="panel">
          <h2>🎯 Missão</h2>
          <p class="story">${esc(t.story)}</p>
          <div class="scene" id="scene"></div>
        </div>
        <div class="panel">
          <h2>🧾 Programa <small style="font-weight:600;color:var(--muted);font-family:var(--f-body)">(${G.slots.length} cartas)</small></h2>
          <ol class="slots" id="slots"></ol>
          <div class="prog-actions">
            <button class="btn small" id="b-undo">↩ Desfazer</button>
            <button class="btn small" id="b-clear">🧹 Limpar</button>
            <button class="btn go" id="b-run">▶ Rodar programa</button>
          </div>
        </div>
      </div>
      <div id="result"></div>
      <div class="panel pool-panel">
        <h2>🃏 Cartas na mesa <small style="font-weight:600;color:var(--muted);font-family:var(--f-body)">toque numa carta para colocar no programa</small></h2>
        <div class="pool" id="pool"></div>
      </div>`;
    $('#b-undo').onclick = undo;
    $('#b-clear').onclick = clearProg;
    $('#b-run').onclick = runProgram;
    drawScene();
    drawSlots();
    drawPool();
    drawTurn();
  }

  function drawTurn() {
    const el = $('#turn'); if (!el) return;
    el.style.setProperty('--pc', playerColor(G.turn));
    el.innerHTML = `<i></i> Vez de: ${playerName(G.turn)}`;
  }

  function hintKind(i) {
    const sol = G.task.solutions[0];
    return sol[i] ? CARDS[sol[i]].kind : null;
  }

  function drawSlots(marks = {}) {
    const next = G.slots.indexOf(null);
    $('#slots').innerHTML = G.slots.map((s, i) => {
      const k = hintKind(i);
      const hint = G.hints && k ? `style="--hint: var(--c-${k === 'mover' ? 'acao' : k})"` : '';
      const cls = ['slot', i === next && !G.running ? 'next' : '', marks[i] || ''].join(' ');
      if (!s) return `<li class="${cls}" ${hint}><span class="ln-n">${i + 1}</span><span class="empty">${i === next ? 'Próxima carta aqui' : 'vazio'}${G.hints && k ? ` · ${KINDS[k].label}` : ''}</span></li>`;
      return `<li class="${cls}"><span class="ln-n">${i + 1}</span>${cardHTML(s.cid, { tag: 'button', mini: true, attrs: `class="filled" data-slot="${i}" aria-label="Tirar a carta ${esc(CARDS[s.cid].text)} da linha ${i + 1}"` })}</li>`;
    }).join('');
    $$('#slots [data-slot]').forEach(b => { b.onclick = () => removeAt(+b.dataset.slot); });
    $('#b-run').disabled = G.running || G.slots.includes(null);
    $('#b-undo').disabled = G.running || G.slots.every(s => !s);
    $('#b-clear').disabled = G.running || G.slots.every(s => !s);
  }

  function drawPool() {
    $('#pool').innerHTML = G.pool.map(p => cardHTML(p.cid, {
      tag: 'button',
      attrs: `data-uid="${p.uid}" aria-label="${esc(CARDS[p.cid].text)}" ${p.used ? 'disabled' : ''}`
    })).join('');
    $$('#pool [data-uid]').forEach(b => {
      const p = G.pool.find(x => x.uid === +b.dataset.uid);
      if (p.used) b.classList.add('used');
      b.onclick = () => placeCard(p);
    });
  }

  function placeCard(p) {
    if (G.running || p.used) return;
    const i = G.slots.indexOf(null);
    if (i === -1) { toast('O programa já está completo. Aperte ▶ Rodar!'); return; }
    G.slots[i] = { uid: p.uid, cid: p.cid };
    p.used = true;
    G.turn = (G.turn + 1) % G.players;
    G.result = null; $('#result').innerHTML = '';
    sfx.place();
    let marks = {};
    if (G.checkEach) marks = checkPrefix(i);
    drawSlots(marks); drawPool(); drawTurn();
    resetScene();
  }

  function checkPrefix(i) {
    const t = G.task, prog = G.slots.slice(0, i + 1).map(s => s.cid);
    let bad = null;
    if (t.type === 'robot') {
      for (const w of (t.worlds || [{}])) {
        const r = runRobot(t, prog, w, true);
        if (r.error) { bad = { line: r.error.line, msg: r.error.msg + (t.worlds ? (w.rock ? ' (com pedra)' : ' (sem pedra)') : '') }; break; }
      }
    } else {
      const e = seqFirstError(t, prog);
      if (e !== -1) bad = { line: e, msg: errorMessage(t, prog[e]) };
    }
    if (bad) { sfx.bad(); toast(`🐛 Bug na linha ${bad.line + 1}! ${bad.msg}`); return { [bad.line]: 'bug' }; }
    return { [i]: 'good' };
  }

  function removeAt(i) {
    if (G.running) return;
    const s = G.slots[i]; if (!s) return;
    G.pool.find(p => p.uid === s.uid).used = false;
    G.slots[i] = null;
    G.result = null; $('#result').innerHTML = '';
    drawSlots(); drawPool(); resetScene();
  }
  function undo() {
    for (let i = G.slots.length - 1; i >= 0; i--) if (G.slots[i]) { removeAt(i); G.turn = (G.turn - 1 + G.players) % G.players; drawTurn(); return; }
  }
  function clearProg() {
    if (G.running) return;
    G.slots.forEach((s, i) => { if (s) G.pool.find(p => p.uid === s.uid).used = false; G.slots[i] = null; });
    G.result = null; $('#result').innerHTML = '';
    drawSlots(); drawPool(); resetScene();
  }

  /* ----- Cena (mapa, caixas, tela do computador) ----- */
  function mapHTML(t, snap, revealed, crashAt) {
    const g = t.grid;
    const pos = snap ? snap.pos : g.start;
    const rock = snap ? snap.rock : null;
    let html = `<div class="map" style="grid-template-columns: repeat(${g.cols}, auto)">`;
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
      const here = [r, c];
      const isWall = (g.walls || []).some(w => eq(w, here));
      const isGoal = eq(g.goal, here);
      const maybe = !revealed && g.rockAt && eq(g.rockAt, here);
      let content = '';
      if (isWall) content = '🧱';
      else if (eq(pos, here)) content = `<span class="bit-token">${bitSVG(crashAt ? 'sad' : 'happy')}</span>`;
      else if (rock && eq(rock, here)) content = ICON_ROCK;
      else if (maybe) content = '❓';
      else if (isGoal) content = g.door ? '🚪' : '🔋';
      const cls = ['cell', isWall ? 'wall' : '', isGoal ? 'goal' : '', maybe ? 'maybe' : '', crashAt && eq(crashAt, here) ? 'crash' : ''].join(' ');
      html += `<div class="${cls}">${content}</div>`;
    }
    return html + '</div>';
  }

  function resetScene() { if (!G.running) { G.world = null; drawScene(); } }

  function drawScene() {
    const t = G.task, sc = $('#scene'); if (!sc) return;
    let html = '';
    if (t.type === 'robot') html += `<div id="map-wrap">${mapHTML(t, null, false)}</div>`;
    if (t.surprise) html += `<div class="surprise" id="surprise"><span class="s-card">?</span><p>Carta Surpresa: o Computador sorteia na hora de rodar.</p></div>`;
    if (t.vars) html += `<div class="boxes" id="boxes">${boxesHTML({ A: null, B: null, TOTAL: null })}</div>`;
    html += `<div class="screen" id="screen" aria-live="polite"><div class="ln sys">Computador pronto. Monte o programa e aperte ▶ Rodar.<span class="blink">_</span></div></div>`;
    sc.innerHTML = html;
  }
  function boxesHTML(v, popKey) {
    return ['A', 'B', 'TOTAL'].map(k => `<div class="vbox${popKey === k ? ' pop' : ''}"><div class="lid">${k}</div><div class="val${v[k] == null ? ' empty' : ''}">${v[k] == null ? 'vazia' : v[k]}</div></div>`).join('');
  }
  function log(text, cls = '') {
    const s = $('#screen'); if (!s) return;
    const d = document.createElement('div'); d.className = 'ln ' + cls; d.textContent = text;
    s.appendChild(d); s.scrollTop = s.scrollHeight;
  }

  /* ----- Rodar o programa ----- */
  async function runProgram() {
    if (G.running) return;
    if (G.slots.includes(null)) { toast('Complete o programa primeiro!'); return; }
    const t = G.task;
    const prog = G.slots.map(s => s.cid);
    G.running = true; $('#result').innerHTML = '';
    drawSlots();
    const world = t.worlds ? pick(t.worlds) : {};
    G.world = world;
    $('#screen').innerHTML = '';
    log('COMPILANDO... bip bop 🤖', 'sys');
    await sleep(700);

    if (t.surprise) {
      const s = SURPRISES[t.surprise(world)];
      const el = $('#surprise');
      el.classList.add('revealed');
      el.innerHTML = `<span class="s-card">${s.icon}</span><p>Surpresa: ${esc(s.text)}!</p>`;
      log(`🎴 Surpresa: ${s.text.replace(/<[^>]+>/g, '')}`, 'sys');
      if (t.type === 'robot') $('#map-wrap').innerHTML = mapHTML(t, { pos: t.grid.start, rock: world.rock ? t.grid.rockAt : null }, true);
      sfx.step();
      await sleep(1100);
    }

    const res = runTask(t, prog, world);
    const lineMarks = {};
    for (const st of res.steps) {
      const marks = { ...lineMarks, [st.line]: st.skipped ? 'skipped' : 'running' };
      drawSlots(marks);
      lineMarks[st.line] = st.skipped ? 'skipped' : 'good';
      log(`linha ${st.line + 1}: ${st.text}`, st.skipped ? 'skip' : '');
      if (t.type === 'robot') $('#map-wrap').innerHTML = mapHTML(t, st, true);
      if (t.vars && st.vars) {
        const changed = ['A', 'B', 'TOTAL'].find(k => st.vars[k] != null && (!G._lastVars || G._lastVars[k] !== st.vars[k]));
        $('#boxes').innerHTML = boxesHTML(st.vars, changed);
        G._lastVars = st.vars;
      }
      sfx.step();
      await sleep(reduceMotion() ? 350 : 850);
    }
    G._lastVars = null;

    if (res.error) {
      const marks = { ...lineMarks, [res.error.line]: 'bug' };
      drawSlotsFinal(marks);
      if (t.type === 'robot') {
        const last = res.steps.length ? res.steps[res.steps.length - 1] : { pos: t.grid.start, rock: world.rock ? t.grid.rockAt : null };
        $('#map-wrap').innerHTML = mapHTML(t, last, true, res.error.crashAt || last.pos);
      }
      log(`❌ ERRO NA LINHA ${res.error.line + 1}`, 'err');
      sfx.bad();
      showResult('bug', res.error);
      G.running = false; drawSlotsFinal(marks);
      return;
    }

    // Sucesso neste sorteio. O programa funciona em TODOS os casos?
    let other = null;
    if (t.worlds) {
      for (const w of t.worlds) {
        if (w === world) continue;
        const r = runTask(t, prog, w);
        if (r.error) { other = { w, err: r.error }; break; }
      }
    }
    drawSlotsFinal(lineMarks);
    G.running = false;
    if (other) {
      log('⚠️ Funcionou desta vez... mas e no outro caso?', 'err');
      sfx.wrong();
      showResult('warn', other);
      drawSlotsFinal(lineMarks);
      return;
    }
    log('✅ PROGRAMA FUNCIONOU!', 'ok');
    sfx.good(); confetti();
    G.stars[t.id] = true; store.set('stars', G.stars);
    showResult('win', { text: t.win(t.vars ? res.vars : world) });
    drawSlotsFinal(lineMarks);
  }
  function drawSlotsFinal(marks) { drawSlots(marks); }

  function showResult(kind, data) {
    const t = G.task;
    const idx = TASKS.indexOf(t);
    const nextT = TASKS[idx + 1];
    let html = '';
    if (kind === 'bug') {
      html = `<div class="result" style="--rc: var(--bad)">
        <h2>🐛 Bug na linha ${data.line + 1}!</h2>
        <p>${esc(data.msg)}</p>
        <p class="learn">Quem acha o bug? Toque na carta errada do programa para tirá-la e conserte.</p>
        <div class="row"><button class="btn primary" id="r-fix">🔧 Consertar o bug</button></div>
      </div>`;
    } else if (kind === 'warn') {
      const caso = t.surprise ? SURPRISES[t.surprise(data.w)].text.toLowerCase() : 'no outro caso';
      html = `<div class="result" style="--rc: var(--warn)">
        <h2>🤔 Funcionou... desta vez!</h2>
        <p>Mas se a surpresa fosse "${esc(caso)}", teria um bug na linha ${data.err.line + 1}: ${esc(data.err.msg)}</p>
        <p class="learn">Um bom programa funciona em todos os casos. É para isso que serve o SE!</p>
        <div class="row"><button class="btn primary" id="r-fix">🔧 Melhorar o programa</button><button class="btn" id="r-again">🎲 Rodar de novo</button></div>
      </div>`;
    } else {
      html = `<div class="result" style="--rc: var(--ok)">
        <h2>🎉 Programa funcionou!</h2>
        <p>${esc(data.text)}</p>
        <p class="learn">💡 ${esc(t.learn)}</p>
        <div class="row">
          ${t.worlds ? '<button class="btn" id="r-again">🎲 Rodar de novo (nova surpresa)</button>' : ''}
          ${nextT ? `<button class="btn primary" id="r-next">Próxima missão: ${nextT.icon} ${esc(nextT.title)} →</button>` : '<button class="btn primary" id="r-list">🏆 Ver todas as missões</button>'}
        </div>
      </div>`;
    }
    $('#result').innerHTML = html;
    const fix = $('#r-fix'); if (fix) fix.onclick = () => { $('#result').innerHTML = ''; resetScene(); drawSlots(); document.getElementById('slots').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    const again = $('#r-again'); if (again) again.onclick = () => { drawScene(); runProgram(); };
    const nx = $('#r-next'); if (nx) nx.onclick = () => startTask(nextT.id);
    const ls = $('#r-list'); if (ls) ls.onclick = () => go('missoes');
    $('#result').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }

  /* ---------------- Estudar (quiz) ---------------- */
  const Q = { cat: 'Todas', list: [], i: 0, score: 0, combo: 0, right: 0, missed: [], answered: false };

  function qGridHTML(v) {
    const g = v.grid;
    let html = `<div class="map" style="grid-template-columns: repeat(${g.cols}, auto)">`;
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
      const x = g.cells[`${r},${c}`] || '';
      html += `<div class="cell">${x === 'BIT' ? `<span class="bit-token">${bitSVG()}</span>` : esc(x)}</div>`;
    }
    return html + '</div>';
  }

  function renderStudy() {
    const cats = ['Todas', ...QCATS];
    $('#v-estudar').innerHTML = `
      <div class="quiz-start">
        <div>
          <h1>Desafio do Bit 🧠</h1>
          <p>10 perguntas de múltipla escolha sobre lógica de programação e sobre o jogo das cartas. Acerte em sequência para ganhar bônus!</p>
          <div class="cats" role="group" aria-label="Tema das perguntas">
            ${cats.map(c => `<button data-cat="${c}" aria-pressed="${Q.cat === c}">${c}</button>`).join('')}
          </div>
          <button class="btn primary" id="q-start">▶ Começar</button>
        </div>
        <div class="q-bit-big">${bitSVG('happy')}</div>
      </div>`;
    $$('.cats button').forEach(b => {
      b.onclick = () => { Q.cat = b.dataset.cat; $$('.cats button').forEach(x => x.setAttribute('aria-pressed', x === b)); };
    });
    $('#q-start').onclick = startQuiz;
  }

  function startQuiz() {
    const pool = Q.cat === 'Todas' ? QUESTIONS : QUESTIONS.filter(q => q.cat === Q.cat);
    Q.list = shuffle(pool).slice(0, 10).map(q => {
      const order = shuffle(q.o.map((_, i) => i));
      return { ...q, opts: order.map(i => q.o[i]), ans: order.indexOf(q.a) };
    });
    Q.i = 0; Q.score = 0; Q.combo = 0; Q.right = 0; Q.missed = [];
    drawQuestion();
  }

  function drawQuestion(mood = 'happy') {
    const q = Q.list[Q.i];
    Q.answered = false;
    let visual = '';
    if (q.v && q.v.grid) visual = `<div class="q-visual">${qGridHTML(q.v)}</div>`;
    if (q.v && q.v.box) visual = `<div class="q-visual"><div class="vbox solo"><div class="lid">${esc(q.v.box.name)}</div><div class="val" style="font-size:1.4rem">${esc(q.v.box.value)}</div></div></div>`;
    $('#v-estudar').innerHTML = `
      <div class="quiz-top">
        <button class="btn small ghost" id="q-exit">✕ Sair</button>
        <span class="score">Pergunta ${Q.i + 1}/${Q.list.length}</span>
        <span class="bar" aria-hidden="true"><i style="width:${(Q.i / Q.list.length) * 100}%"></i></span>
        <span class="score">⭐ ${Q.score}</span>
        ${Q.combo >= 2 ? `<span class="combo">🔥 ${Q.combo} seguidas!</span>` : ''}
      </div>
      <div class="q-card">
        <div class="q-head">
          <div class="q-bit" id="q-bit">${bitSVG(mood)}</div>
          <div class="bubble"><div class="q-cat">${esc(q.cat)}</div><h2>${esc(q.q)}</h2></div>
        </div>
        ${visual}
        <div class="opts">
          ${q.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="letter">${'ABCD'[i]}</span><span>${esc(o)}</span></button>`).join('')}
        </div>
        <div id="q-feedback"></div>
      </div>`;
    $('#q-exit').onclick = renderStudy;
    $$('.opt').forEach(b => { b.onclick = () => answer(+b.dataset.i); });
  }

  function answer(i) {
    if (Q.answered) return;
    Q.answered = true;
    const q = Q.list[Q.i];
    const ok = i === q.ans;
    $$('.opt').forEach((b, j) => {
      b.disabled = true;
      if (j === q.ans) b.classList.add('right');
      else if (j === i) b.classList.add('wrong');
    });
    if (ok) {
      Q.combo++; Q.right++;
      const pts = 10 + (Q.combo >= 3 ? 5 : 0);
      Q.score += pts;
      sfx.right();
      if (Q.combo === 3 || Q.combo === 5) confetti(30);
    } else {
      Q.combo = 0; Q.missed.push(q.cat);
      sfx.wrong();
    }
    $('#q-bit').innerHTML = bitSVG(ok ? 'wow' : 'sad');
    const last = Q.i === Q.list.length - 1;
    const praise = pick(['Mandou bem!', 'Isso aí!', 'Acertou!', 'Bit está orgulhoso!', 'Show de bola!']);
    $('#q-feedback').innerHTML = `<div class="feedback ${ok ? 'good' : 'bad'}">
      <p>${ok ? `✅ ${praise}${Q.combo >= 3 ? ' +5 de bônus 🔥' : ''}` : `❌ Quase! A resposta certa é a letra ${'ABCD'[q.ans]}.`} ${esc(q.e)}</p>
      <button class="btn primary" id="q-next">${last ? 'Ver resultado 🏆' : 'Próxima →'}</button>
    </div>`;
    const nb = $('#q-next'); nb.focus();
    nb.onclick = () => { if (last) quizEnd(); else { Q.i++; drawQuestion(); } };
  }

  function quizEnd() {
    const total = Q.list.length;
    const pct = Q.right / total;
    const medal = pct >= 0.9 ? '🥇' : pct >= 0.7 ? '🥈' : pct >= 0.4 ? '🥉' : '🎖️';
    const title = pct >= 0.9 ? 'Programador(a) Mestre!' : pct >= 0.7 ? 'Muito bem!' : pct >= 0.4 ? 'Bom trabalho!' : 'Continue treinando!';
    const stars = Math.max(1, Math.round(pct * 5));
    const missedCats = [...new Set(Q.missed)];
    if (pct >= 0.7) { sfx.good(); confetti(); }
    $('#v-estudar').innerHTML = `
      <div class="quiz-end">
        <div class="medal">${medal}</div>
        <h1>${title}</h1>
        <div class="stars" aria-label="${stars} de 5 estrelas">${'⭐'.repeat(stars)}${'☆'.repeat(5 - stars)}</div>
        <p style="font-size:1.15rem;font-weight:700;margin:0">Você acertou ${Q.right} de ${total} perguntas e fez ${Q.score} pontos.</p>
        ${missedCats.length ? `<div class="review"><p style="margin:8px 0 4px;font-weight:800">Vale a pena revisar:</p><ul>${missedCats.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>` : '<p style="margin:0">Você acertou tudo! 🎉</p>'}
        <div class="row" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px">
          <button class="btn primary" id="q-again">🔁 Jogar de novo</button>
          <button class="btn" data-go="missoes">🎮 Ir para as missões</button>
        </div>
      </div>`;
    $('#q-again').onclick = startQuiz;
  }

  /* ---------------- Professor (senha + impressão) ---------------- */
  // Senha padrão: bit2026 (pode ser trocada dentro da área do professor).
  // Atenção: em um site estático a senha só protege contra curiosos; não guarde nada secreto aqui.
  const DEFAULT_HASH = '2crfaer4q67';
  function hash(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  const passHash = p => hash('missao-bit:' + p);
  const currentHash = () => store.get('passHash', DEFAULT_HASH);

  const PRINT = store.get('print', { missions: true, actions: true, moves: true, traps: true, wild: true, surprises: true, extras: true, gabarito: true, moveCopies: 1 });

  function renderAdmin() {
    if (session.get('admin') !== '1') return renderLogin();
    const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
    const tab = session.get('atab') || 'guia';
    const head = `
      <div class="page-head no-print">
        <div>
          <h1>Área do professor</h1>
          <p>${tab === 'guia' ? 'Seu roteiro para dar a aula com o Missão Bit, do primeiro "bom dia" ao fechamento.' : 'Escolha o que imprimir. As cartas saem no tamanho de baralho (63 × 88 mm), 9 por folha A4. Recorte nas linhas tracejadas.'}</p>
        </div>
        <button class="btn small ghost" id="a-logout">🔒 Sair</button>
      </div>
      <div class="tabs no-print" role="tablist" aria-label="Seções do professor">
        <button role="tab" data-tab="guia" aria-selected="${tab === 'guia'}">📘 Guia da aula</button>
        <button role="tab" data-tab="imprimir" aria-selected="${tab === 'imprimir'}">🖨️ Imprimir cartas</button>
      </div>`;
    const bindHead = () => {
      $('#a-logout').onclick = () => { session.set('admin', null); renderAdmin(); };
      $$('[data-tab]').forEach(b => { b.onclick = () => { session.set('atab', b.dataset.tab); renderAdmin(); window.scrollTo(0, 0); }; });
    };
    if (tab === 'guia') {
      $('#v-professor').innerHTML = head + guideHTML(inFrame);
      bindHead(); bindGuide();
      return;
    }
    $('#v-professor').innerHTML = head + `
      <div class="admin-grid">
        <div class="admin-side no-print">
          <div class="panel">
            <h2>🖨️ O que imprimir</h2>
            <div class="checks">
              <label><input type="checkbox" data-p="missions"> Missões <small>7</small></label>
              <label><input type="checkbox" data-p="actions"> Cartas das missões <small>21</small></label>
              <label><input type="checkbox" data-p="moves"> Setas de movimento <small id="mv-count"></small></label>
              <label><input type="checkbox" data-p="traps"> Cartas pegadinha <small>6</small></label>
              <label><input type="checkbox" data-p="wild"> Coringas <small>2</small></label>
              <label><input type="checkbox" data-p="surprises"> Cartas Surpresa <small>6</small></label>
              <label><input type="checkbox" data-p="extras"> Regras + crachá do Computador <small>2</small></label>
              <label><input type="checkbox" data-p="gabarito"> Gabarito do professor <small>1 folha</small></label>
            </div>
            <div class="field" style="margin-top:12px">
              <label for="mv-copies">Cópias das setas (para turmas grandes)</label>
              <select id="mv-copies"><option value="1">1×</option><option value="2">2×</option><option value="3">3×</option></select>
            </div>
            <p class="note" id="sheet-count"></p>
            <div style="margin-top:12px;display:grid;gap:8px">
              <button class="btn primary" id="a-print" ${inFrame ? 'disabled' : ''}>🖨️ Imprimir / salvar PDF</button>
              ${inFrame ? '<p class="note">A impressão fica bloqueada nesta visualização. Abra o site direto no navegador do computador para imprimir.</p>' : '<p class="note">Na janela de impressão, escolha papel A4, margens "Nenhuma" e marque "Gráficos de plano de fundo".</p>'}
            </div>
          </div>
          <div class="panel">
            <h2>🔑 Trocar senha</h2>
            <form id="pw-form" style="display:grid;gap:10px">
              <div class="field"><label for="pw-new">Nova senha</label><input id="pw-new" type="password" minlength="4" autocomplete="new-password" required></div>
              <div class="field"><label for="pw-new2">Repita a nova senha</label><input id="pw-new2" type="password" minlength="4" autocomplete="new-password" required></div>
              <p class="err" id="pw-msg" hidden></p>
              <button class="btn small" type="submit">Salvar senha</button>
              <p class="note">A nova senha fica salva só neste navegador.</p>
            </form>
          </div>
          <div class="panel">
            <h2>⭐ Progresso</h2>
            <p class="note" style="margin-top:0">Missões concluídas neste aparelho: ${Object.keys(G.stars).length} de ${TASKS.length}.</p>
            <button class="btn small" id="a-reset" style="margin-top:8px">Zerar estrelas das missões</button>
          </div>
        </div>
        <div>
          <div class="sheets-scroll"><div class="sheets" id="print-area"></div></div>
        </div>
      </div>`;
    $$('[data-p]').forEach(cb => {
      cb.checked = !!PRINT[cb.dataset.p];
      cb.onchange = () => { PRINT[cb.dataset.p] = cb.checked; store.set('print', PRINT); drawSheets(); };
    });
    $('#mv-copies').value = String(PRINT.moveCopies || 1);
    $('#mv-copies').onchange = e => { PRINT.moveCopies = +e.target.value; store.set('print', PRINT); drawSheets(); };
    $('#a-print').onclick = () => window.print();
    bindHead();
    $('#a-reset').onclick = e => {
      const b = e.currentTarget;
      if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'Tem certeza? Toque de novo'; return; }
      G.stars = {}; store.set('stars', G.stars); toast('Estrelas zeradas.'); renderAdmin();
    };
    $('#pw-form').onsubmit = e => {
      e.preventDefault();
      const a = $('#pw-new').value, b = $('#pw-new2').value, msg = $('#pw-msg');
      if (a.length < 4) { msg.textContent = 'Use pelo menos 4 caracteres.'; msg.hidden = false; return; }
      if (a !== b) { msg.textContent = 'As duas senhas estão diferentes.'; msg.hidden = false; return; }
      store.set('passHash', passHash(a)); msg.hidden = true; e.target.reset(); toast('Senha trocada!');
    };
    drawSheets();
  }

  /* ----- Guia da aula ----- */
  const PHASES = [
    { from: 0, to: 3, icon: '🤖', title: 'Abertura: "Eu sou um robô"', text: 'Vire o robô e deixe a turma te dar ordens. Faça tudo ao pé da letra.' },
    { from: 3, to: 6, icon: '💡', title: 'Mini-aula: algoritmo e variável', text: 'Escovar os dentes (algoritmo) e a caixa de PONTOS (variável).' },
    { from: 6, to: 8, icon: '🃏', title: 'Regras do jogo', text: 'Mostre as cores das cartas, a mesa aberta e o crachá do Computador.' },
    { from: 8, to: 16, icon: '🎮', title: 'Missões', text: '🚗 Ligar o carro → ➕ Figurinhas → 🔋 Pedra no caminho.' },
    { from: 16, to: 18, icon: '🏁', title: 'Grande final', text: 'Rode de novo a missão da pedra com a outra Surpresa. Comemorem!' },
    { from: 18, to: 20, icon: '🎤', title: 'Fechamento', text: 'Três perguntas rápidas e a frase final.' }
  ];
  const CHECKLIST = [
    'Cartas impressas, recortadas e separadas por cor',
    'Missões separadas na ordem: 2 Carro, 3 Figurinhas, 5 Pedra (as outras ficam de reserva)',
    'Fita crepe ou ímãs para colar o programa no quadro',
    '3 caixinhas com etiqueta A, B e TOTAL + 5 figurinhas de papel',
    'Um estojo para ser a "pedra" e uma cadeira para ser o "carro"',
    'Crachá "Eu sou o Computador" pendurado no pescoço',
    'Site aberto na tela interativa (de preferência instalado, para funcionar sem internet)',
    'Som do app ligado e volume da sala testado',
    'Ensaiar a voz de robô e o "COMPILANDO... bip bop" 😄'
  ];
  const T = { start: 0, acc: 0, running: false, timer: null };
  const elapsed = () => T.acc + (T.running ? Date.now() - T.start : 0);
  const fmt = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  function say(text) { return `<blockquote class="say"><span>Fale</span>${text}</blockquote>`; }
  function guideHTML(inFrame) {
    const done = store.get('checklist', []);
    return `
    <div class="guide">
      <div class="g-summary">
        <div><b>Tema</b><span>Introdução à Lógica de Programação</span></div>
        <div><b>Turma</b><span>Crianças de 8 anos</span></div>
        <div><b>Duração</b><span>20 minutos</span></div>
        <div><b>Objetivo</b><span>Ao final, cada criança sabe dizer o que é algoritmo e variável, e já usou SE e REPITA brincando.</span></div>
      </div>

      <section class="g-block no-print" aria-labelledby="g-timer-t">
        <div class="g-timer">
          <div>
            <h2 id="g-timer-t">⏱️ Relógio da aula</h2>
            <p class="note" style="margin:2px 0 0">Aperte Iniciar quando disser "bom dia". A fase atual fica destacada.</p>
          </div>
          <div class="g-clock" id="g-clock">${fmt(elapsed())}</div>
          <div class="g-timer-btns">
            <button class="btn small go" id="g-start">${T.running ? '⏸ Pausar' : '▶ Iniciar'}</button>
            <button class="btn small" id="g-reset">↺ Zerar</button>
          </div>
        </div>
      </section>

      <section class="g-block" aria-labelledby="g-plan-t">
        <h2 id="g-plan-t">🗺️ Roteiro de 20 minutos</h2>
        <ol class="phases" id="g-phases">
          ${PHASES.map((p, i) => `<li data-ph="${i}"><span class="ph-time">${p.from}–${p.to} min</span><span class="ph-ico">${p.icon}</span><div><b>${p.title}</b><p>${p.text}</p></div></li>`).join('')}
        </ol>
        <p class="note">Os 3 pilares do CNA aparecem assim: <b>Divertir</b> (robô e bugs engraçados), <b>Ensinar</b> (conceitos com exemplos do dia a dia) e <b>Desenvolver</b> (a turma monta e conserta o programa em equipe).</p>
      </section>

      <section class="g-block" aria-labelledby="g-check-t">
        <h2 id="g-check-t">✅ Antes da aula</h2>
        <div class="g-checks">
          ${CHECKLIST.map((c, i) => `<label><input type="checkbox" data-ck="${i}" ${done.includes(i) ? 'checked' : ''}> ${esc(c)}</label>`).join('')}
        </div>
      </section>

      <section class="g-block" aria-labelledby="g-why-t">
        <h2 id="g-why-t">🤔 Explico lógica antes de jogar?</h2>
        <p><b>Sim, mas pouco: uns 3 minutos.</b> Criança de 8 anos aprende fazendo. Apresente só <b>algoritmo</b> e <b>variável</b> antes do jogo, porque são os dois conceitos pedidos na aula. O <b>SE</b> e o <b>REPITA</b> você explica na hora em que a carta aparecer na missão. Fica mais fácil de entender e não cansa a turma.</p>
        <p>Regra de ouro: <b>uma ideia, um exemplo, uma pergunta</b>. Depois passe para a próxima.</p>
      </section>

      <section class="g-block" aria-labelledby="g-open-t">
        <h2 id="g-open-t">🤖 Como começar a falar (0–3 min)</h2>
        ${say('Bom dia, turma! Hoje eu não sou o professor... <i>(voz de robô)</i> BIP BOP. Eu sou um ROBÔ! E robô só faz EXATAMENTE o que mandam. Quem quer me dar uma ordem?')}
        <p>Uma criança vai falar algo como "anda!" ou "pega o giz". Obedeça <b>ao pé da letra</b>:</p>
        <ul>
          <li>"Anda!" → ande sem parar até a parede. Pergunte: <i>"Vocês não falaram quantos passos!"</i></li>
          <li>"Senta!" → sente no chão, não na cadeira.</li>
          <li>"Pega o giz!" → fique parado: <i>"Qual mão? Onde está o giz?"</i></li>
        </ul>
        ${say('Viram? O computador é assim: ele não adivinha. A gente precisa dar instruções claras e na ordem certa.')}
      </section>

      <section class="g-block" aria-labelledby="g-concepts-t">
        <h2 id="g-concepts-t">💡 Os conceitos, com exemplos prontos</h2>
        <div class="concepts">
          <article class="concept k-acao">
            <h3><i class="dot"></i>Algoritmo <small>antes do jogo</small></h3>
            ${say('Uma lista de passos em ordem tem um nome difícil: ALGORITMO. É como uma receita de bolo!')}
            <p><b>Exemplo:</b> escovar os dentes. Peça para a turma ditar os passos. Se pularem "colocar a pasta", escove sem pasta e faça cara de nojo.</p>
            <p><b>Pergunte:</b> "O que acontece se eu enxaguar antes de escovar?"</p>
          </article>
          <article class="concept k-caixa">
            <h3><i class="dot"></i>Variável <small>antes do jogo</small></h3>
            ${say('O computador guarda as coisas em caixinhas com nome. O que tem dentro pode mudar. Por isso se chama VARIÁVEL!')}
            <p><b>Exemplo:</b> mostre a caixa PONTOS com 2 papéis. "Acertei uma pergunta!" Coloque mais 1. "Quanto tem agora?" → 3.</p>
            <p><b>Pergunte:</b> "Que nome daria para a caixa que guarda a sua idade?"</p>
          </article>
          <article class="concept k-se">
            <h3><i class="dot"></i>Condição (SE) <small>na missão</small></h3>
            ${say('SE estiver chovendo, eu levo guarda-chuva. SENÃO, eu levo boné. O computador também toma decisões assim!')}
            <p><b>Exemplo:</b> semáforo. "SE estiver vermelho..." (a turma completa: "PARA!").</p>
            <p><b>Momento:</b> quando a carta verde aparecer na missão da Pedra ou do Clima.</p>
          </article>
          <article class="concept k-repita">
            <h3><i class="dot"></i>Repetição (REPITA) <small>na missão</small></h3>
            ${say('Bate palma, bate palma, bate palma... cansei! Vou escrever só uma vez: REPITA 3 vezes, bater palma.')}
            <p><b>Exemplo:</b> a turma bate palmas junto com você.</p>
            <p><b>Momento:</b> missão 7 (Até a porta), se der tempo, ou só a fala com palmas.</p>
          </article>
          <article class="concept k-coringa">
            <h3><i class="dot"></i>Bug <small>o tempo todo</small></h3>
            ${say('Quando o programa dá errado, a gente chama de BUG. Todo programador do mundo tem bugs. O segredo é achar e consertar!')}
            <p><b>Atitude:</b> comemore quando acharem um bug. Errar faz parte do jogo.</p>
          </article>
        </div>
      </section>

      <section class="g-block" aria-labelledby="g-rules-t">
        <h2 id="g-rules-t">🃏 Explicando as regras (6–8 min)</h2>
        <ol>
          <li>Coloque o crachá: ${say('Agora eu sou o COMPUTADOR. Vocês são os PROGRAMADORES.')}</li>
          <li>Mostre uma carta de cada cor: azul faz uma ação, amarela é a caixa, verde é o SE, vermelha é o REPITA.</li>
          <li>Leia a missão e mostre os espaços vazios: "Nosso programa tem 4 linhas."</li>
          <li>Cada um, na sua vez, coloca 1 carta. Pode pedir ajuda ao colega.</li>
          <li>Antes de rodar, todo mundo vota: 👍 certo ou 👎 tem bug.</li>
        </ol>
      </section>

      <section class="g-block" aria-labelledby="g-play-t">
        <h2 id="g-play-t">🖥️ Durante o jogo: seu papel de Computador</h2>
        <ul class="g-list">
          <li>Antes de rodar, fale <b>"COMPILANDO... bip bop"</b> e leia cada carta em voz alta, executando de verdade.</li>
          <li>Se der bug, <b>congele</b>: <i>"ERRO NA LINHA 3!"</i>, e pergunte: <i>"Quem acha o bug?"</i></li>
          <li>Faça a besteira acontecer: sentar sem abrir a porta, tirar a pedra que não existe... É aí que a turma ri e aprende.</li>
          <li>Na missão da pedra, rode <b>duas vezes</b>: com pedra e sem pedra. Mostre que o mesmo programa funciona nos dois casos.</li>
          <li>Elogie o processo, não só o acerto: <i>"Que bom que vocês acharam o bug!"</i></li>
          <li>Na tela interativa, use o app para mostrar o robô andando depois que a turma montar com as cartas de papel.</li>
        </ul>
      </section>

      <section class="g-block" aria-labelledby="g-impro-t">
        <h2 id="g-impro-t">🆘 Se acontecer... faça assim</h2>
        <div class="impro">
          <div><b>Sobrou tempo</b><p>Jogue as missões 6 (Luz) e 7 (Porta), ou abra o "Estudar" na tela e a turma vota nas respostas.</p></div>
          <div><b>Faltou tempo</b><p>Pule direto para a missão 5 (Pedra no caminho), que mostra o SE, e faça o fechamento.</p></div>
          <div><b>Criança tímida</b><p>Dê um cargo: "Ajudante do Computador" (vira a carta Surpresa) ou "Caça-bugs oficial".</p></div>
          <div><b>Criança que já sabe tudo</b><p>Desafie: "Existe outro caminho certo?" ou "Invente uma instrução com a carta Coringa".</p></div>
          <div><b>Turma agitada</b><p>"O Computador TRAVOU!" Fique congelado. Só reinicia quando todos contarem juntos: 3, 2, 1, LIGA!</p></div>
          <div><b>Ninguém acha o bug</b><p>Rode bem devagar, linha por linha, perguntando: "Essa linha está certa?"</p></div>
          <div><b>Você errou algo</b><p>"Até o Computador tem bug! Quem me conserta?" Vira parte da brincadeira.</p></div>
          <div><b>A tela ou a internet falhou</b><p>O jogo funciona só com as cartas de papel. O app instalado também funciona sem internet.</p></div>
        </div>
      </section>

      <section class="g-block" aria-labelledby="g-close-t">
        <h2 id="g-close-t">🎤 Fechamento (18–20 min)</h2>
        <p>Três perguntas rápidas. A turma responde junta:</p>
        <ol>
          <li>"O que é um algoritmo?" → <i>passos em ordem</i></li>
          <li>"O que a caixa guarda?" → <i>um valor, que pode mudar</i></li>
          <li>"Quando usamos o SE?" → <i>para decidir</i></li>
        </ol>
        ${say('Hoje vocês foram PROGRAMADORES! Programar é dar instruções claras, na ordem certa, e consertar os bugs sem medo. BIP BOP, desligando!')}
      </section>

      <section class="g-block" aria-labelledby="g-cheat-t">
        <h2 id="g-cheat-t">📝 Frases curinga</h2>
        <div class="cheats">
          <span>"Eu só faço o que vocês mandarem!"</span>
          <span>"Quantos passos? Vocês não falaram!"</span>
          <span>"COMPILANDO... bip bop"</span>
          <span>"ERRO NA LINHA 2!"</span>
          <span>"Quem acha o bug?"</span>
          <span>"Todo mundo concorda? 👍 ou 👎"</span>
          <span>"Existe outro jeito de resolver?"</span>
          <span>"E se tivesse uma pedra no caminho?"</span>
        </div>
      </section>

      <div class="no-print" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn primary" id="g-print" ${inFrame ? 'disabled' : ''}>🖨️ Imprimir este guia</button>
        <button class="btn" data-go="missoes">🎮 Abrir as missões</button>
      </div>
    </div>`;
  }

  function paintTimer() {
    const clock = $('#g-clock'); if (!clock) return;
    const ms = elapsed();
    clock.textContent = fmt(ms);
    const min = ms / 60000;
    clock.classList.toggle('over', min >= 20);
    $$('#g-phases li').forEach(li => {
      const p = PHASES[+li.dataset.ph];
      li.classList.toggle('now', (T.running || ms > 0) && min >= p.from && min < p.to);
      li.classList.toggle('past', min >= p.to);
    });
  }
  function bindGuide() {
    $('#g-start').onclick = e => {
      if (T.running) { T.acc = elapsed(); T.running = false; clearInterval(T.timer); }
      else { T.start = Date.now(); T.running = true; T.timer = setInterval(paintTimer, 500); }
      e.currentTarget.textContent = T.running ? '⏸ Pausar' : '▶ Iniciar';
      paintTimer();
    };
    $('#g-reset').onclick = () => {
      T.acc = 0; T.start = Date.now();
      if (!T.running) paintTimer(); else paintTimer();
    };
    $$('[data-ck]').forEach(cb => {
      cb.onchange = () => {
        const list = $$('[data-ck]').filter(x => x.checked).map(x => +x.dataset.ck);
        store.set('checklist', list);
      };
    });
    $('#g-print').onclick = () => window.print();
    if (T.running && !T.timer) T.timer = setInterval(paintTimer, 500);
    paintTimer();
  }

  function renderLogin() {
    $('#v-professor').innerHTML = `
      <form class="login" id="login">
        <div style="width:70px">${bitSVG('happy')}</div>
        <h1>Área do professor</h1>
        <p>Digite a senha para imprimir as cartas do jogo.</p>
        <div class="field"><label for="pw">Senha</label><input id="pw" type="password" autocomplete="current-password" required></div>
        <p class="err" id="login-err" hidden>Senha incorreta. Tente de novo.</p>
        <button class="btn primary" type="submit">Entrar</button>
      </form>`;
    $('#login').onsubmit = e => {
      e.preventDefault();
      if (passHash($('#pw').value) === currentHash()) { session.set('admin', '1'); renderAdmin(); }
      else { $('#login-err').hidden = false; $('#pw').select(); sfx.wrong(); }
    };
    setTimeout(() => { const p = $('#pw'); if (p) p.focus(); }, 50);
  }

  /* ----- Montagem das folhas ----- */
  const MOVE_SET = [['dir_r', 6], ['dir_u', 3], ['dir_l', 2], ['dir_d', 2]];
  function printList() {
    const L = [];
    if (PRINT.missions) TASKS.forEach(t => L.push({ type: 'mission', t }));
    if (PRINT.actions) {
      const seen = new Set();
      TASKS.forEach(t => t.solutions.forEach(sol => sol.forEach(cid => {
        if (CARDS[cid].kind === 'mover' || seen.has(cid)) return;
        seen.add(cid); L.push({ type: 'card', cid });
      })));
    }
    if (PRINT.moves) for (let k = 0; k < (PRINT.moveCopies || 1); k++) MOVE_SET.forEach(([cid, n]) => { for (let i = 0; i < n; i++) L.push({ type: 'card', cid }); });
    if (PRINT.traps) Object.keys(CARDS).filter(c => CARDS[c].bug).forEach(cid => L.push({ type: 'card', cid }));
    if (PRINT.wild) { L.push({ type: 'card', cid: 'coringa' }); L.push({ type: 'card', cid: 'coringa' }); }
    if (PRINT.surprises) Object.keys(SURPRISES).forEach(id => L.push({ type: 'surprise', id }));
    if (PRINT.extras) { L.push({ type: 'rules' }); L.push({ type: 'pc' }); }
    return L;
  }

  function pcCard(cid) {
    const c = CARDS[cid], t = taskOf(cid);
    return `<div class="pc"><div class="pc-in k-${c.kind}">
      <div class="pc-head"><span>${KINDS[c.kind].label}</span>${t ? `<span class="t-ico">${t.icon}</span>` : ''}</div>
      <div class="pc-ico">${c.icon}</div>
      <div class="pc-text">${esc(c.text)}</div>
      ${cid === 'coringa' ? '<div class="pc-foot">Escreva aqui: ____________</div>' : ''}
      <div class="pc-code">${esc(c.code)}</div>
    </div></div>`;
  }
  function pcSurprise(id) {
    const s = SURPRISES[id];
    return `<div class="pc"><div class="pc-in k-surpresa">
      <div class="pc-head"><span>SURPRESA</span><span class="t-ico">🎴</span></div>
      <div class="pc-ico">${s.icon}</div>
      <div class="pc-text">${s.text}</div>
      <div class="pc-foot">${esc(s.group.toUpperCase())} · vire na hora de rodar</div>
    </div></div>`;
  }
  function pcMission(t) {
    let map = '';
    if (t.type === 'robot') {
      const g = t.grid;
      map = `<div class="pm-map" style="grid-template-columns: repeat(${g.cols}, auto)">`;
      for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
        const h = [r, c];
        const wall = (g.walls || []).some(w => eq(w, h));
        let x = '';
        if (wall) x = '🧱';
        else if (eq(g.start, h)) x = bitSVG('happy', 'bitmini');
        else if (g.rockAt && eq(g.rockAt, h)) x = '❓';
        else if (eq(g.goal, h)) x = g.door ? '🚪' : '🔋';
        map += `<div class="pcell${wall ? ' wall' : ''}">${x}</div>`;
      }
      map += '</div>';
    }
    const n = t.slots || t.solutions[0].length;
    const kinds = t.solutions[0].map(cid => CARDS[cid].kind);
    return `<div class="pc pc-mission"><div class="pc-in">
      <div class="pc-head"><span>MISSÃO ${t.n}</span><span class="t-ico">${t.icon}</span></div>
      <div class="pm-ico">${t.icon}</div>
      <div class="pm-title">${esc(t.title)}</div>
      <div><span class="pm-tag k-${t.ckind}">${t.concept}</span></div>
      <div class="pm-story">${esc(t.story)}</div>
      ${map}
      <div class="pm-slots"><div class="row">${kinds.map(k => `<span class="sq k-${k}"></span>`).join('')}</div><small>PROGRAMA COM ${n} CARTAS</small></div>
    </div></div>`;
  }
  function pcRules() {
    return `<div class="pc pc-rules"><div class="pc-in">
      <div class="pc-head" style="background:#15213B;color:#fff"><span>COMO JOGAR</span><span class="t-ico">📜</span></div>
      <ol>
        <li>O Computador (professor) revela a missão.</li>
        <li>Cartas abertas na mesa. Na sua vez, coloque 1 carta no próximo espaço.</li>
        <li>Não tem a carta? Peça ajuda a um colega.</li>
        <li>Todos votam: 👍 certo ou 👎 bug?</li>
        <li>O Computador roda e faz EXATAMENTE o que está escrito.</li>
        <li>Bug? Quem achar, conserta!</li>
      </ol>
      <div class="legendp">
        <span class="k-acao"><i></i>AÇÃO / MOVER</span><span class="k-caixa"><i></i>CAIXA</span>
        <span class="k-se"><i></i>SE / SENÃO</span><span class="k-repita"><i></i>REPITA</span>
      </div>
    </div></div>`;
  }
  function pcComputer() {
    return `<div class="pc pc-pc"><div class="pc-in">
      <div class="pc-head"><span>CRACHÁ</span><span class="t-ico">🖥️</span></div>
      ${bitSVG('happy', 'bigbit')}
      <div class="pc-text" style="font-size:15pt">EU SOU O<br>COMPUTADOR</div>
      <div class="pc-foot" style="font-size:7.5pt">Faço exatamente o que o programa manda. Nem mais, nem menos!</div>
    </div></div>`;
  }
  function gabaritoSheet() {
    const chip = cid => { const c = CARDS[cid]; return `<span class="c k-${c.kind}">${c.icon} ${esc(c.text)}</span>`; };
    return `<div class="sheet doc gab">
      <h1>Gabarito do Computador</h1>
      <p class="sub">Para o professor. Aceite outra sequência se ela também resolver a missão: existe mais de um algoritmo certo.</p>
      ${TASKS.map(t => `<div class="g-item">
        <h3>${t.icon} Missão ${t.n}: ${esc(t.title)} <small>· ${t.concept}</small></h3>
        ${t.solutions.map((s, i) => `<div class="g-seq">${i ? '<b>ou:</b> ' : ''}${s.map(chip).join(' → ')}</div>`).join('')}
        <p class="g-tip"><b>Dica:</b> ${esc(t.tip)}</p>
      </div>`).join('')}
    </div>`;
  }

  function drawSheets() {
    const list = printList();
    const html = [];
    for (let i = 0; i < list.length; i += 9) {
      const chunk = list.slice(i, i + 9).map(it => {
        if (it.type === 'mission') return pcMission(it.t);
        if (it.type === 'card') return pcCard(it.cid);
        if (it.type === 'surprise') return pcSurprise(it.id);
        if (it.type === 'rules') return pcRules();
        if (it.type === 'pc') return pcComputer();
        return '';
      }).join('');
      html.push(`<div class="sheet">${chunk}</div>`);
    }
    if (PRINT.gabarito) html.push(gabaritoSheet());
    $('#print-area').innerHTML = html.join('') || '<p class="note" style="padding:20px">Marque pelo menos um grupo de cartas para ver as folhas.</p>';
    const mv = MOVE_SET.reduce((a, [, n]) => a + n, 0) * (PRINT.moveCopies || 1);
    $('#mv-count').textContent = mv;
    const sheets = Math.ceil(list.length / 9) + (PRINT.gabarito ? 1 : 0);
    $('#sheet-count').textContent = `${list.length} cartas em ${sheets} folha${sheets === 1 ? '' : 's'} A4.`;
  }

  /* ---------------- Inicialização ---------------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t); else document.documentElement.removeAttribute('data-theme');
  }
  /* ----- Instalação como app (PWA) ----- */
  let installEvt = null;
  const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  function installHelp() {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && 'ontouchend' in document);
    const android = /Android/.test(ua);
    let html;
    if (location.protocol === 'file:') {
      html = '<p>Você abriu o arquivo direto do computador. Para instalar, abra o jogo pelo endereço do site (https://...) no Chrome ou no Edge.</p>';
    } else if (ios) {
      html = '<ol><li>Abra este site no <b>Safari</b>.</li><li>Toque no botão <b>Compartilhar</b> (quadrado com seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li></ol>';
    } else if (android) {
      html = '<ol><li>No <b>Chrome</b>, toque no menu <b>⋮</b> (canto de cima).</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li></ol>';
    } else {
      html = '<ol><li>No <b>Chrome</b> ou <b>Edge</b>, clique no ícone de instalar na barra de endereço (um monitor com seta ⤓), à direita.</li><li>Ou abra o menu <b>⋮</b> / <b>…</b> e escolha <b>Instalar Missão Bit</b> (no Edge: <b>Aplicativos → Instalar este site como aplicativo</b>).</li></ol>';
    }
    html += '<p class="note">Depois de instalado, o jogo abre como um app e funciona sem internet.</p>';
    $('#ih-body').innerHTML = html;
    $('#install-help').hidden = false;
    $('#ih-close').focus();
  }
  function setupInstall() {
    const btn = $('#btn-install');
    btn.hidden = isStandalone();
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; btn.hidden = false; });
    window.addEventListener('appinstalled', () => { installEvt = null; btn.hidden = true; toast('App instalado! 🎉'); });
    btn.onclick = async () => {
      if (installEvt) {
        installEvt.prompt();
        try { await installEvt.userChoice; } catch (e) { /* ok */ }
        installEvt = null;
      } else installHelp();
    };
    const close = () => { $('#install-help').hidden = true; };
    $('#ih-close').onclick = close;
    $('#install-help').onclick = e => { if (e.target.id === 'install-help') close(); };
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  function init() {
    setupInstall();
    $('#brand-bit').innerHTML = bitSVG('happy');
    applyTheme(store.get('theme', null));
    $('#btn-theme').onclick = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const t = isDark ? 'light' : 'dark'; applyTheme(t); store.set('theme', t);
    };
    const sb = $('#btn-sound');
    const paintSound = () => { sb.textContent = soundOn ? '🔊' : '🔇'; sb.setAttribute('aria-label', soundOn ? 'Som ligado' : 'Som desligado'); };
    paintSound();
    sb.onclick = () => { soundOn = !soundOn; store.set('sound', soundOn); paintSound(); if (soundOn) sfx.place(); };
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-go]');
      if (b) { e.preventDefault(); go(b.dataset.go); }
    });
    document.addEventListener('keydown', e => {
      if (location.hash !== '#estudar' || Q.answered) return;
      const n = '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase());
      const opt = $$('.opt')[n]; if (n >= 0 && opt) opt.click();
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('offline', () => toast('Sem internet. O jogo continua funcionando normalmente. 👍'));
    window.addEventListener('online', () => toast('Internet de volta.'));
    route();
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('sw.js').catch(() => { /* sem modo offline */ });
    }
  }

  // Exposto para testes no console
  window.MissaoBit = { runTask, runSeq, runRobot, TASKS, passHash };
  init();
})();
