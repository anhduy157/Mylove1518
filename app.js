(() => {
  const cfg = window.LOVE_CONFIG || {};

  const startScreen = document.getElementById("startScreen");
  const sceneWrap = document.getElementById("sceneWrap");
  const scene = document.getElementById("scene");
  const fallLayer = document.getElementById("fallLayer");
  const startHeartCanvas = document.getElementById("startHeartCanvas");
  const sceneHeartCanvas = document.getElementById("sceneHeartCanvas");
  const startBtn = document.getElementById("startBtn");
  const soundBtn = document.getElementById("soundBtn");
  const music = document.getElementById("music");
  const finale = document.getElementById("finale");
  const finaleCanvas = document.getElementById("finaleCanvas");
  const finaleCopy = document.getElementById("finaleCopy");
  const finalePhoto = document.getElementById("finalePhoto");
  const finaleTitle = document.getElementById("finaleTitle");
  const finaleMessage = document.getElementById("finaleMessage");
  const replayBtn = document.getElementById("replayBtn");
  const proposal = document.getElementById("proposal");
  const proposalQuestion = document.getElementById("proposalQuestion");
  const proposalYesBtn = document.getElementById("proposalYesBtn");
  const proposalNoBtn = document.getElementById("proposalNoBtn");
  const proposalNoMessage = document.getElementById("proposalNoMessage");
  const proposalHappyEnd = document.getElementById("proposalHappyEnd");
  const proposalVideo = document.getElementById("proposalVideo");
  const birthdayFinale = document.getElementById("birthdayFinale");
  const birthdayFireworks = document.getElementById("birthdayFireworks");
  const birthdayFinalTitle = document.getElementById("birthdayFinalTitle");
  const birthdayFinalMessage = document.getElementById("birthdayFinalMessage");
  const birthdayFinalReplayBtn = document.getElementById("birthdayFinalReplayBtn");
  const birthdayFinalPhotoLeft = document.getElementById("birthdayFinalPhotoLeft");
  const birthdayFinalPhotoRight = document.getElementById("birthdayFinalPhotoRight");
  const finaleCtx = finaleCanvas?.getContext("2d", { alpha: true });

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  setText("startTitle", cfg.startTitle || "Chạm để mở ❤️");
  setText("startSub", cfg.startSub || "");
  setText("anniversary", cfg.anniversaryText || "Happy Anniversary");
  setText("days", cfg.dayCount || "");

  function getBirthdayTarget(dayOfMonth) {
    const now = new Date();
    const targetDay = Math.max(1, Math.min(31, Number(dayOfMonth || 28)));
    let target = new Date(now.getFullYear(), now.getMonth(), targetDay);

    if (target <= now) {
      target = new Date(now.getFullYear(), now.getMonth() + 1, targetDay);
    }

    return target;
  }

  function updateBirthdayCountdown() {
    const countdown = document.getElementById("birthdayCountdown");
    const target = getBirthdayTarget(cfg.birthdayDay || 28);
    const remaining = Math.max(0, target - new Date());
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    const pad = value => String(value).padStart(2, "0");
    const text = `❤️❤️❤️❤️❤️❤️❤️`;

    setText("birthdayCountdown", text);
    if (countdown) countdown.hidden = false;
  }

  updateBirthdayCountdown();
  window.setInterval(updateBirthdayCountdown, 1000);

  // Đổi màu nhanh từ config.js
  if (cfg.theme) {
    const root = document.documentElement.style;
    if (cfg.theme.background) root.setProperty("--bg", cfg.theme.background);
    if (cfg.theme.cyan) root.setProperty("--cyan", cfg.theme.cyan);
    if (cfg.theme.cyanStrong) root.setProperty("--cyan-strong", cfg.theme.cyanStrong);
    if (cfg.theme.pink) root.setProperty("--pink", cfg.theme.pink);
    if (cfg.theme.red) root.setProperty("--red", cfg.theme.red);
  }

  if (cfg.musicFile && music) music.src = cfg.musicFile;

  const state = {
    running: false,
    mobile: isMobileLike(),
    muted: false,
    musicWanted: false,
    musicReady: false,
    currentMusicFile: cfg.musicFile || "",
    musicRetryTimer: 0,
    pointerX: 0,
    pointerY: 0,
    targetX: 0,
    targetY: 0,
    gyroX: 0,
    gyroY: 0,
    startHeartActive: true,
    startHeartParticles: [],
    startHeartRaf: 0,
    startHeartLast: performance.now(),
    startHeartImage: null,
    sceneHeartActive: false,
    sceneHeartParticles: [],
    sceneHeartRaf: 0,
    sceneHeartLast: performance.now(),
    sceneHeartImage: null,
    particles: [],
    fallTimers: [],
    birthdayTimers: [],
    finalizing: false,
    finaleActive: false,
    finaleParticles: [],
    mobileHeartParticles: [],
    finaleTimer: 0,
    finaleMessageTimer: 0,
    proposalTimer: 0,
    birthdayFinaleTimer: 0,
    birthdayFireworkTimers: [],
    birthdayMelodyTimers: [],
    birthdayAudioCtx: null,
    finaleReplayTimer: 0,
    finaleRaf: 0,
    finaleStart: 0,
    finaleViewport: { width: 0, height: 0, dpr: 1 },
    last: performance.now()
  };

  const phrases = [
    ...(cfg.phrases || []),
    cfg.birthday?.enabled && cfg.birthday?.text ? cfg.birthday.text : "",
    cfg.personA || "Hà Trang",
    cfg.personB || "Quang Duy"
  ].filter(Boolean);

  const fallTexts = (cfg.fallTexts && cfg.fallTexts.length ? cfg.fallTexts : phrases).filter(Boolean);
  const desktopFallImages = (cfg.fallImages || []).filter(Boolean);
  const mobileFallImages = (cfg.mobileFallImages || desktopFallImages).filter(Boolean);
  const fallImageBags = {
    desktop: [],
    mobile: []
  };

  function getFallImages() {
    return state.mobile ? mobileFallImages : desktopFallImages;
  }

  function shuffleCopy(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickFallImage() {
    const images = getFallImages();
    if (!images.length) return "";

    const key = state.mobile ? "mobile" : "desktop";
    if (!fallImageBags[key].length) {
      fallImageBags[key] = shuffleCopy(images);
    }

    return fallImageBags[key].pop();
  }

  const names = new Set([cfg.personA, cfg.personB].filter(Boolean));

  function rnd(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function isMobileLike() {
    return Math.min(window.innerWidth, window.innerHeight) <= 700 ||
      window.matchMedia?.("(pointer: coarse)")?.matches;
  }

  function buildStars() {
    const holder = document.getElementById("stars");
    if (!holder) return;
    const count = state.mobile ? 14 : Math.min(95, Math.floor((innerWidth * innerHeight) / 9000));

    for (let i = 0; i < count; i++) {
      const s = document.createElement("i");
      s.className = "star";
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty("--d", `${rnd(1.3, 4.8)}s`);
      s.style.setProperty("--o", rnd(.18, .82).toFixed(2));
      holder.appendChild(s);
    }
  }

  // =========================
  // TRÁI TIM HẠT Ở MÀN MỞ ĐẦU
  // =========================
  function createHeartParticleImage(size) {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    c.width = size;
    c.height = size;

    ctx.beginPath();
    for (let t = -Math.PI; t <= Math.PI; t += .04) {
      const p = pointOnHeart(t);
      const x = size / 2 + p.x * size / 38;
      const y = size / 2 + p.y * size / 38;
      if (t === -Math.PI) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "#ff5ca4";
    ctx.fill();
    return c;
  }

  function resizeStartHeartCanvas() {
    if (!startHeartCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = startHeartCanvas.getBoundingClientRect();
    startHeartCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    startHeartCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = startHeartCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawStartHeart(now) {
    if (!state.startHeartActive || !startHeartCanvas) return;

    const ctx = startHeartCanvas.getContext("2d");
    const width = startHeartCanvas.clientWidth;
    const height = startHeartCanvas.clientHeight;
    const dt = Math.min(.034, (now - state.startHeartLast) / 1000 || .016);
    state.startHeartLast = now;

    if (!state.startHeartImage) {
      state.startHeartImage = createHeartParticleImage(state.mobile ? 12 : 15);
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const maxParticles = state.mobile ? 90 : 160;
    const spawn = state.mobile ? 3 : 5;
    const scale = Math.min(width, height) / 42;
    const centerX = width / 2;
    const centerY = height / 2 + scale * 1.5;

    for (let i = 0; i < spawn && state.startHeartParticles.length < maxParticles; i++) {
      const t = rnd(-Math.PI, Math.PI);
      const p = pointOnHeart(t);
      const len = Math.max(1, Math.hypot(p.x, p.y));
      const speed = rnd(34, 88);
      state.startHeartParticles.push({
        x: centerX + p.x * scale,
        y: centerY + p.y * scale,
        vx: (p.x / len) * speed,
        vy: (p.y / len) * speed,
        age: 0,
        life: rnd(1.1, 1.9),
        size: rnd(.45, 1.05)
      });
    }

    for (let i = state.startHeartParticles.length - 1; i >= 0; i--) {
      const p = state.startHeartParticles[i];
      p.age += dt;
      if (p.age >= p.life) {
        state.startHeartParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= .982;
      p.vy *= .982;

      const progress = p.age / p.life;
      const alpha = 1 - progress;
      const size = state.startHeartImage.width * p.size * (1 + progress * .85);
      ctx.globalAlpha = alpha * .9;
      ctx.drawImage(state.startHeartImage, p.x - size / 2, p.y - size / 2, size, size);
    }

    state.startHeartRaf = requestAnimationFrame(drawStartHeart);
  }

  function startOpeningHeart() {
    if (!startHeartCanvas) return;
    resizeStartHeartCanvas();
    state.startHeartActive = true;
    state.startHeartLast = performance.now();
    state.startHeartRaf = requestAnimationFrame(drawStartHeart);
  }

  function stopOpeningHeart() {
    state.startHeartActive = false;
    cancelAnimationFrame(state.startHeartRaf);
    state.startHeartParticles = [];
    const ctx = startHeartCanvas?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, startHeartCanvas.clientWidth, startHeartCanvas.clientHeight);
  }

  function resizeSceneHeartCanvas() {
    if (!sceneHeartCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = sceneHeartCanvas.getBoundingClientRect();
    sceneHeartCanvas.width = Math.max(1, Math.round(rect.width * dpr));
    sceneHeartCanvas.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = sceneHeartCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawSceneHeart(now) {
    if (!state.sceneHeartActive || !sceneHeartCanvas) return;

    const ctx = sceneHeartCanvas.getContext("2d");
    const width = sceneHeartCanvas.clientWidth;
    const height = sceneHeartCanvas.clientHeight;
    const dt = Math.min(.034, (now - state.sceneHeartLast) / 1000 || .016);
    state.sceneHeartLast = now;

    if (!state.sceneHeartImage) {
      state.sceneHeartImage = createHeartParticleImage(state.mobile ? 10 : 13);
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    const maxParticles = state.mobile ? 100 : 220;
    const spawn = state.mobile ? 3 : 6;
    const scale = Math.min(width, height) / 44;
    const centerX = width / 2;
    const centerY = height / 2 + scale * 1.5;

    for (let i = 0; i < spawn && state.sceneHeartParticles.length < maxParticles; i++) {
      const t = rnd(-Math.PI, Math.PI);
      const p = pointOnHeart(t);
      const len = Math.max(1, Math.hypot(p.x, p.y));
      const speed = rnd(24, 64);
      state.sceneHeartParticles.push({
        x: centerX + p.x * scale,
        y: centerY + p.y * scale,
        vx: (p.x / len) * speed,
        vy: (p.y / len) * speed,
        age: 0,
        life: rnd(1.4, 2.3),
        size: rnd(.42, .95)
      });
    }

    for (let i = state.sceneHeartParticles.length - 1; i >= 0; i--) {
      const p = state.sceneHeartParticles[i];
      p.age += dt;
      if (p.age >= p.life) {
        state.sceneHeartParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= .986;
      p.vy *= .986;

      const progress = p.age / p.life;
      const alpha = (1 - progress) * .62;
      const size = state.sceneHeartImage.width * p.size * (1 + progress * .72);
      ctx.globalAlpha = alpha;
      ctx.drawImage(state.sceneHeartImage, p.x - size / 2, p.y - size / 2, size, size);
    }

    state.sceneHeartRaf = requestAnimationFrame(drawSceneHeart);
  }

  function startSceneHeart() {
    if (!sceneHeartCanvas) return;
    resizeSceneHeartCanvas();
    state.sceneHeartActive = true;
    state.sceneHeartLast = performance.now();
    state.sceneHeartRaf = requestAnimationFrame(drawSceneHeart);
  }

  function stopSceneHeart() {
    state.sceneHeartActive = false;
    cancelAnimationFrame(state.sceneHeartRaf);
    state.sceneHeartParticles = [];
    const ctx = sceneHeartCanvas?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, sceneHeartCanvas.clientWidth, sceneHeartCanvas.clientHeight);
  }

  // =========================
  // HIỆU ỨNG 3D GỐC
  // =========================
  function createParticle(kind, forceNear = false) {
    const el = document.createElement("div");
    el.classList.add("particle");

    let text;
    let baseSize;
    let speed;

    if (kind === "heart") {
      const filled = Math.random() > .26;
      text = filled ? "❤" : "♡";
      el.classList.add(filled ? "heart" : "outline-heart");
      baseSize = rnd(18, 42);
      speed = rnd(78, 148);
    } else {
      text = pick(phrases);
      el.classList.add("text");
      if (names.has(text)) el.classList.add("name");
      baseSize = rnd(14, 30);
      speed = rnd(58, 116);
    }

    el.textContent = text;
    el.style.fontSize = `${baseSize}px`;
    scene.appendChild(el);

    const p = {
      el,
      kind,
      x: rnd(-innerWidth * .72, innerWidth * .72),
      y: rnd(-innerHeight * .72, innerHeight * .72),
      z: forceNear ? rnd(-300, 250) : rnd(-1900, 260),
      rz: rnd(-15, 15),
      speed,
      driftX: rnd(-4.5, 4.5),
      driftY: rnd(-3.4, 3.4),
      opacitySeed: rnd(.75, 1.0)
    };

    state.particles.push(p);
    return p;
  }

  function resetParticle(p) {
    p.x = rnd(-innerWidth * .72, innerWidth * .72);
    p.y = rnd(-innerHeight * .72, innerHeight * .72);
    p.z = rnd(-2200, -1200);
    p.rz = rnd(-15, 15);
    p.driftX = rnd(-4.5, 4.5);
    p.driftY = rnd(-3.4, 3.4);

    if (p.kind === "text") {
      const text = pick(phrases);
      p.el.textContent = text;
      p.el.classList.toggle("name", names.has(text));
    }
  }

  function buildParticles() {
    scene.innerHTML = "";
    state.particles = [];

    if (state.mobile) return;

    const area = innerWidth * innerHeight;
    const textCount = Math.max(34, Math.min(68, Math.floor(area / 16000)));
    const heartCount = Math.max(12, Math.min(26, Math.floor(area / 43000)));

    for (let i = 0; i < textCount; i++) createParticle("text", i < 12);
    for (let i = 0; i < heartCount; i++) createParticle("heart", i < 4);
  }

  function update(dt) {
    state.pointerX += (state.targetX - state.pointerX) * .055;
    state.pointerY += (state.targetY - state.pointerY) * .055;

    const cameraX = state.pointerX * 74 + state.gyroX * 42;
    const cameraY = state.pointerY * 58 + state.gyroY * 34;

    for (const p of state.particles) {
      p.z += p.speed * dt;
      p.x += p.driftX * dt;
      p.y += p.driftY * dt;

      if (p.z > 520) resetParticle(p);

      const depth = Math.max(0, Math.min(1, (p.z + 2200) / 2700));
      const nearBoost = Math.pow(depth, 1.45);
      const opacity = Math.max(.08, Math.min(1, (.22 + nearBoost * .88) * p.opacitySeed));
      const blur = p.z > 250 ? Math.min(10, (p.z - 250) / 32) : 0;

      p.el.style.opacity = opacity.toFixed(3);

      if (state.mobile) {
        const mobileScale = Math.max(.72, Math.min(1.34, .74 + depth * .72));
        p.el.style.filter = "";
        p.el.style.transform =
          `translate3d(calc(-50% + ${p.x - cameraX}px), calc(-50% + ${p.y - cameraY}px), 0) rotateZ(${p.rz}deg) scale(${mobileScale.toFixed(3)})`;
      } else {
        p.el.style.filter = blur > .2 ? `blur(${blur.toFixed(1)}px)` : "";
        p.el.style.transform =
          `translate3d(calc(-50% + ${p.x - cameraX}px), calc(-50% + ${p.y - cameraY}px), ${p.z}px) rotateZ(${p.rz}deg)`;
      }
    }
  }

  function loop(now) {
    const dt = Math.min(.034, (now - state.last) / 1000);
    state.last = now;

    if (state.running && !state.mobile) update(dt);
    requestAnimationFrame(loop);
  }

  // =========================
  // CHỮ / ẢNH / TIM RƠI TỪ TRÊN XUỐNG
  // =========================
  function getFallConfig(kind) {
    const fall = cfg.falling || {};
    return fall[kind] || {};
  }

  function activeFallCount() {
    return fallLayer ? fallLayer.childElementCount : 0;
  }

  function activeFallCountByKind(kind) {
    return fallLayer ? fallLayer.querySelectorAll(`.fall-${kind}`).length : 0;
  }

  function getMaxFallItems(kind) {
    const fall = cfg.falling || {};
    if (!state.mobile) return Number(fall.maxItems || 28);

    const mobileLimits = fall.mobileMaxByKind || {};
    const fallback = Number(fall.mobileMaxItems ?? fall.maxItems ?? 18);
    const kindFallback = { text: 9, image: 5, heart: 6 };
    return Number(mobileLimits[kind] ?? kindFallback[kind] ?? fallback);
  }

  function createFallingItem(kind) {
    const fall = cfg.falling || {};
    if (!state.running || !fall.enabled || !fallLayer) return;
    const maxFallItems = getMaxFallItems(kind);
    if (state.mobile) {
      if (activeFallCountByKind(kind) >= maxFallItems) return;
    } else if (activeFallCount() >= maxFallItems) {
      return;
    }

    const itemCfg = getFallConfig(kind);
    if (itemCfg.enabled === false) return;

    const el = document.createElement(kind === "image" ? "img" : "div");
    el.className = `fall-item fall-${kind}`;

    const activeImages = getFallImages();

    if (kind === "text") {
      if (!fallTexts.length) return;
      const text = pick(fallTexts);
      el.textContent = text;
      if (names.has(text)) el.classList.add("fall-name");
    } else if (kind === "image") {
      if (!activeImages.length) return;
      el.src = pickFallImage();
      el.alt = "";
      el.loading = "lazy";
      el.decoding = "async";
      el.draggable = false;
      el.addEventListener("error", () => el.remove(), { once: true });
    } else {
      el.textContent = Math.random() > .18 ? "❤" : "♡";
    }

    const minSpeed = Number(itemCfg.minSpeed ?? 8);
    const maxSpeed = Number(itemCfg.maxSpeed ?? 15);
    const minSize = Number(itemCfg.minSize ?? 16);
    const maxSize = Number(itemCfg.maxSize ?? 28);

    const duration = rnd(Math.min(minSpeed, maxSpeed), Math.max(minSpeed, maxSpeed));
    const size = rnd(Math.min(minSize, maxSize), Math.max(minSize, maxSize));
    const sway = rnd(fall.swayMin ?? 18, fall.swayMax ?? 80) * (Math.random() > .5 ? 1 : -1);
    const rotate = rnd(fall.rotateMin ?? -22, fall.rotateMax ?? 22);
    const startX = rnd(3, 97);
    const delay = rnd(-duration * .12, 0);

    el.style.left = `${startX}%`;
    el.style.setProperty("--fall-duration", `${duration}s`);
    el.style.setProperty("--fall-delay", `${delay}s`);
    el.style.setProperty("--fall-size", `${size}px`);
    el.style.setProperty("--sway", `${sway}px`);
    el.style.setProperty("--sway-mid", `${-sway * .45}px`);
    el.style.setProperty("--sway-end", `${sway * .28}px`);
    el.style.setProperty("--rotate-start", `${-rotate * .45}deg`);
    el.style.setProperty("--rotate-mid", `${rotate * .45}deg`);
    el.style.setProperty("--rotate", `${rotate}deg`);
    el.style.setProperty("--rotate-end", `${rotate * 1.35}deg`);
    el.style.setProperty("--fall-opacity", rnd(.58, .96).toFixed(2));

    el.addEventListener("animationend", () => el.remove(), { once: true });
    fallLayer.appendChild(el);
  }

  function scheduleFalling(kind) {
    const fall = cfg.falling || {};
    const itemCfg = getFallConfig(kind);
    if (!fall.enabled || itemCfg.enabled === false) return;

    const rate = Math.max(150, Number(itemCfg.spawnRate || 1200));
    const spread = state.mobile ? .08 : .42;
    const offset = state.mobile
      ? ({ text: 120, heart: 420, image: 760 }[kind] || 0)
      : rnd(0, rate * .6);
    let first = true;

    const scheduleNext = () => {
      if (!state.running || state.finalizing) return;
      const delay = first ? offset : rnd(rate * (1 - spread), rate * (1 + spread));
      first = false;
      const timer = window.setTimeout(() => {
        createFallingItem(kind);
        scheduleNext();
      }, Math.max(220, delay));
      state.fallTimers.push(timer);
    };

    scheduleNext();
  }

  function startFallingEffects() {
    if (!fallLayer || !cfg.falling?.enabled || state.fallTimers.length) return;

    // Mobile không tạo "đợt đầu" dày; chỉ mồi nhẹ rồi để scheduler rơi đều.
    const firstHearts = state.mobile ? 1 : 4;
    const firstTexts = state.mobile ? 1 : 3;

    for (let i = 0; i < firstHearts; i++) {
      const delay = state.mobile ? 520 + i * 1300 : rnd(120, 2800);
      state.fallTimers.push(window.setTimeout(() => createFallingItem("heart"), Math.max(120, delay)));
    }
    for (let i = 0; i < firstTexts; i++) {
      const delay = state.mobile ? 180 + i * 950 : rnd(420, 4200);
      state.fallTimers.push(window.setTimeout(() => createFallingItem("text"), Math.max(120, delay)));
    }
    if (getFallImages().length) {
      const firstImages = state.mobile ? 1 : 2;
      for (let i = 0; i < firstImages; i++) {
        const delay = state.mobile ? 820 + i * 1700 : rnd(260, 3800);
        state.fallTimers.push(window.setTimeout(() => createFallingItem("image"), Math.max(180, delay)));
      }
    }

    scheduleFalling("heart");
    scheduleFalling("text");
    scheduleFalling("image");
  }

  // =========================
  // HIỆU ỨNG SINH NHẬT: CONFETTI + PHÁO HOA NHẸ
  // =========================
  function getBirthdayConfig() {
    return cfg.birthday || {};
  }

  function clearBirthdayTimers() {
    for (const timer of state.birthdayTimers) {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    }
    state.birthdayTimers = [];
  }

  function createConfettiPiece() {
    const birthday = getBirthdayConfig();
    if (!state.running || birthday.enabled === false) return;

    const el = document.createElement("span");
    el.className = "birthday-confetti";

    const shapes = ["", "", "", "❤", "✦"];
    const text = pick(shapes);
    el.textContent = text;
    if (text) el.classList.add("birthday-confetti-symbol");

    const size = text ? rnd(10, 18) : rnd(6, 12);
    const duration = rnd(4.8, 8.5);
    const drift = rnd(-90, 90);
    const hue = Math.floor(rnd(0, 360));
    const spin = rnd(180, 720);

    el.style.left = `${rnd(4, 96)}%`;
    el.style.width = `${size}px`;
    el.style.height = `${text ? size : rnd(size * 1.35, size * 2.2)}px`;
    el.style.setProperty("--confetti-duration", `${duration}s`);
    el.style.setProperty("--confetti-delay", `${rnd(-.4, .2)}s`);
    el.style.setProperty("--confetti-drift", `${drift}px`);
    el.style.setProperty("--confetti-spin-mid", `${spin * .56}deg`);
    el.style.setProperty("--confetti-spin", `${spin}deg`);
    el.style.setProperty("--confetti-color", `hsl(${hue} 92% 68%)`);

    document.body.appendChild(el);
    el.addEventListener("animationend", () => el.remove(), { once: true });
  }

  function createFirework(x = rnd(18, 82), y = rnd(16, 48)) {
    const birthday = getBirthdayConfig();
    if (!state.running || birthday.enabled === false) return;

    const pieces = state.mobile
      ? Number(birthday.mobileFireworkPieces ?? 12)
      : Number(birthday.fireworkPieces ?? 18);
    if (pieces <= 0) return;

    const count = Math.max(8, Math.min(28, Math.round(pieces)));
    const palette = ["#ffe783", "#ff78b7", "#7ee7ff", "#ffffff", "#c99bff"];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rnd(-.12, .12);
      const distance = rnd(state.mobile ? 34 : 42, state.mobile ? 82 : 108);
      const el = document.createElement("span");
      el.className = "birthday-spark";
      el.style.left = `${x}%`;
      el.style.top = `${y}%`;
      el.style.setProperty("--spark-x", `${Math.cos(angle) * distance}px`);
      el.style.setProperty("--spark-y", `${Math.sin(angle) * distance}px`);
      el.style.setProperty("--spark-color", pick(palette));
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }
  }

  function startBirthdayEffects() {
    const birthday = getBirthdayConfig();
    if (birthday.enabled === false || state.birthdayTimers.length) return;
    if (state.mobile &&
        Number(birthday.mobileConfettiBurst ?? 0) <= 0 &&
        Number(birthday.mobileFireworkPieces ?? 0) <= 0) {
      return;
    }

    const burst = state.mobile
      ? Number(birthday.mobileConfettiBurst ?? 26)
      : Number(birthday.confettiBurst ?? 42);
    const count = Math.max(0, Math.min(80, Math.round(burst)));

    for (let i = 0; i < count; i++) {
      state.birthdayTimers.push(window.setTimeout(createConfettiPiece, i * 45));
    }

    state.birthdayTimers.push(window.setTimeout(() => createFirework(28, 28), 650));
    state.birthdayTimers.push(window.setTimeout(() => createFirework(72, 24), 1450));

    const interval = Math.max(2600, Number(birthday.fireworkInterval ?? 5200));
    state.birthdayTimers.push(window.setInterval(() => {
      createFirework(rnd(18, 82), rnd(15, 44));
      for (let i = 0; i < (state.mobile ? 3 : 5); i++) {
        window.setTimeout(createConfettiPiece, i * 120);
      }
    }, interval));
  }

  // Khi click/chạm, bật ra một vài tim nhỏ tạo cảm giác tương tác.
  function createHeartBurst(clientX, clientY) {
    if (!state.running) return;

    for (let i = 0; i < 5; i++) {
      const el = document.createElement("span");
      el.className = "tap-heart";
      el.textContent = "❤";
      el.style.left = `${clientX}px`;
      el.style.top = `${clientY}px`;
      el.style.setProperty("--tx", `${rnd(-55, 55)}px`);
      el.style.setProperty("--ty", `${rnd(-95, -35)}px`);
      el.style.setProperty("--tr", `${rnd(-30, 30)}deg`);
      el.style.fontSize = `${rnd(12, 22)}px`;
      document.body.appendChild(el);
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }
  }

  function setPointer(clientX, clientY) {
    state.targetX = (clientX / innerWidth - .5) * 2;
    state.targetY = (clientY / innerHeight - .5) * 2;
  }

  window.addEventListener("pointermove", e => {
    setPointer(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("pointerdown", e => {
    createHeartBurst(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("touchmove", e => {
    const t = e.touches[0];
    if (t) setPointer(t.clientX, t.clientY);
  }, { passive: true });

  window.addEventListener("deviceorientation", e => {
    if (typeof e.gamma === "number") {
      state.gyroX = Math.max(-1, Math.min(1, e.gamma / 32));
    }
    if (typeof e.beta === "number") {
      state.gyroY = Math.max(-1, Math.min(1, (e.beta - 45) / 45));
    }
  }, true);

  // =========================
  // CẢNH KẾT: HẠT TỤ THÀNH TRÁI TIM 3D
  // =========================
  function getFinaleConfig() {
    return cfg.finale || {};
  }

  function getProposalConfig() {
    const finalCfg = getFinaleConfig();
    return finalCfg.proposal || {};
  }

  function getBirthdayFinaleConfig() {
    const finalCfg = getFinaleConfig();
    return finalCfg.birthdayFinale || {};
  }

  function clearFallTimers() {
    for (const timer of state.fallTimers) {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    }
    state.fallTimers = [];
  }

  function resizeFinaleCanvas() {
    if (!finaleCanvas || !finaleCtx) return;

    const width = Math.max(1, finale?.clientWidth || innerWidth);
    const height = Math.max(1, finale?.clientHeight || innerHeight);
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    finaleCanvas.width = Math.round(width * dpr);
    finaleCanvas.height = Math.round(height * dpr);
    finaleCanvas.style.width = `${width}px`;
    finaleCanvas.style.height = `${height}px`;
    finaleCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.finaleViewport = { width, height, dpr };
  }

  function createFinaleParticle(index) {
    const { width, height } = state.finaleViewport;
    const centerX = width * .5;
    const centerY = height * .43;
    const angle = rnd(0, Math.PI * 2);
    const radius = Math.max(width, height) * rnd(.62, 1.15);

    // Công thức trái tim; phần lớn hạt nằm sát bề mặt, phần còn lại lấp đầy bên trong.
    const t = rnd(0, Math.PI * 2);
    const shell = Math.random() < .72 ? rnd(.82, 1) : Math.sqrt(Math.random()) * .82;
    const x = 16 * Math.pow(Math.sin(t), 3) * shell;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * shell;
    const thickness = 1.4 + (1 - shell) * 8.5;

    return {
      index,
      x,
      y,
      z: rnd(-thickness, thickness),
      startX: centerX + Math.cos(angle) * radius + rnd(-90, 90),
      startY: centerY + Math.sin(angle) * radius + rnd(-90, 90),
      size: rnd(.65, 1.75),
      alpha: rnd(.52, 1),
      phase: rnd(0, Math.PI * 2),
      colorIndex: Math.floor(rnd(0, 3))
    };
  }

  function buildFinaleParticles() {
    const finalCfg = getFinaleConfig();
    const mobile = state.finaleViewport.width <= 700;
    const configuredCount = mobile
      ? Number(finalCfg.mobileParticleCount ?? 950)
      : Number(finalCfg.particleCount ?? 1800);
    const count = Math.max(300, Math.min(3000, Math.round(configuredCount)));

    state.finaleParticles = Array.from({ length: count }, (_, i) => createFinaleParticle(i));
  }

  function easeOutQuint(value) {
    return 1 - Math.pow(1 - value, 5);
  }

  function pointOnHeart(t) {
    return {
      x: 16 * Math.pow(Math.sin(t), 3),
      y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    };
  }

  function startMobileHeartFinale() {
    if (!finaleCanvas || !finaleCtx) return;

    resizeFinaleCanvas();
    state.mobileHeartParticles = [];
    state.finaleStart = performance.now();
    state.finaleRaf = requestAnimationFrame(drawMobileHeartFinale);
  }

  function drawMobileHeartFinale(now) {
    if (!state.finaleActive || !state.mobile || !finaleCtx) return;

    const { width, height } = state.finaleViewport;
    const elapsed = now - state.finaleStart;
    const centerX = width * .5;
    const centerY = height * .34;
    const scale = Math.min(width, height) / 34;
    const palette = ["#ffe783", "#ff78b7", "#ff4f78", "#ffffff"];

    finaleCtx.clearRect(0, 0, width, height);
    finaleCtx.save();
    finaleCtx.globalCompositeOperation = "lighter";

    const spawnCount = width < 390 ? 3 : 4;
    const maxParticles = width < 390 ? 120 : 160;
    for (let i = 0; i < spawnCount && state.mobileHeartParticles.length < maxParticles; i++) {
      const t = rnd(0, Math.PI * 2);
      const p = pointOnHeart(t);
      const angle = Math.atan2(p.y, p.x);
      const speed = rnd(26, 62);
      state.mobileHeartParticles.push({
        x: centerX + p.x * scale,
        y: centerY + p.y * scale,
        vx: Math.cos(angle) * speed + rnd(-10, 10),
        vy: Math.sin(angle) * speed + rnd(-12, 8),
        age: 0,
        life: rnd(1.5, 2.35),
        size: rnd(2.2, 5.2),
        color: pick(palette)
      });
    }

    const dt = Math.min(.034, (now - state.last) / 1000 || .016);
    state.last = now;
    for (let i = state.mobileHeartParticles.length - 1; i >= 0; i--) {
      const p = state.mobileHeartParticles[i];
      p.age += dt;
      if (p.age >= p.life) {
        state.mobileHeartParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= .986;
      p.vy *= .986;

      const progress = p.age / p.life;
      const alpha = (1 - progress) * .88;
      const size = p.size * (1 + progress * 1.8);
      finaleCtx.globalAlpha = alpha;
      finaleCtx.fillStyle = p.color;
      finaleCtx.beginPath();
      finaleCtx.arc(p.x, p.y, size, 0, Math.PI * 2);
      finaleCtx.fill();
    }

    finaleCtx.globalAlpha = .20 + Math.sin(elapsed * .004) * .04;
    finaleCtx.fillStyle = "#ff5e8d";
    finaleCtx.font = `${Math.min(width * .38, 168)}px Arial`;
    finaleCtx.textAlign = "center";
    finaleCtx.textBaseline = "middle";
    finaleCtx.fillText("❤", centerX, centerY + 4);

    finaleCtx.restore();
    state.finaleRaf = requestAnimationFrame(drawMobileHeartFinale);
  }

  function drawFinale(now) {
    if (!state.finaleActive || !finaleCtx) return;

    const finalCfg = getFinaleConfig();
    const { width, height } = state.finaleViewport;
    const assembleDuration = Math.max(1200, Number(finalCfg.assembleDuration ?? 6000));
    const elapsed = Math.max(0, now - state.finaleStart);
    const progress = Math.min(1, elapsed / assembleDuration);
    const eased = easeOutQuint(progress);
    const mobile = width <= 700;
    const baseScale = Math.min(width, height) / (mobile ? 38 : 44);
    const pulse = progress < 1 ? 1 : 1 + Math.sin(elapsed * .0022) * .025;
    const rotateSpeed = Number(finalCfg.rotateSpeed ?? .00022);
    const rotationY = (elapsed - assembleDuration * .48) * rotateSpeed;
    const rotationX = Math.sin(elapsed * .00038) * .11;
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const centerX = width * .5;
    const centerY = height * (mobile ? .40 : .42);
    const palette = Array.isArray(finalCfg.colors) && finalCfg.colors.length
      ? finalCfg.colors
      : ["#ffe783", "#ff78b7", "#c06cff"];
    const colorStep = Math.floor(elapsed / 2100);

    finaleCtx.clearRect(0, 0, width, height);
    finaleCtx.save();
    finaleCtx.globalCompositeOperation = "lighter";

    // Vệt sáng lúc các hạt đang bay vào tâm.
    if (progress < .96) {
      finaleCtx.beginPath();
      for (const p of state.finaleParticles) {
        if (p.index % 5 !== 0) continue;

        const xRotated = p.x * cosY - p.z * sinY;
        const zRotated = p.x * sinY + p.z * cosY;
        const yRotated = p.y * cosX - zRotated * sinX;
        const depth = p.y * sinX + zRotated * cosX;
        const perspective = 560 / Math.max(260, 560 + depth * baseScale);
        const targetX = centerX + xRotated * baseScale * pulse * perspective;
        const targetY = centerY + yRotated * baseScale * pulse * perspective;
        const swirl = Math.sin(p.phase + progress * 10) * (1 - progress) * 34;
        const px = p.startX + (targetX - p.startX) * eased + swirl;
        const py = p.startY + (targetY - p.startY) * eased - swirl * .32;
        const tail = Math.max(.012, (1 - progress) * .035);

        finaleCtx.moveTo(px, py);
        finaleCtx.lineTo(px + (p.startX - px) * tail, py + (p.startY - py) * tail);
      }
      finaleCtx.strokeStyle = `rgba(255, 227, 143, ${Math.max(0, .34 * (1 - progress))})`;
      finaleCtx.lineWidth = mobile ? .7 : 1;
      finaleCtx.stroke();
    }

    for (const p of state.finaleParticles) {
      const xRotated = p.x * cosY - p.z * sinY;
      const zRotated = p.x * sinY + p.z * cosY;
      const yRotated = p.y * cosX - zRotated * sinX;
      const depth = p.y * sinX + zRotated * cosX;
      const perspective = 560 / Math.max(260, 560 + depth * baseScale);
      const targetX = centerX + xRotated * baseScale * pulse * perspective;
      const targetY = centerY + yRotated * baseScale * pulse * perspective;
      const swirl = Math.sin(p.phase + progress * 10) * (1 - progress) * 34;
      const px = p.startX + (targetX - p.startX) * eased + swirl;
      const py = p.startY + (targetY - p.startY) * eased - swirl * .32;
      const depthLight = Math.max(.45, Math.min(1.3, .84 - depth * .035));
      const flicker = .82 + Math.sin(elapsed * .005 + p.phase) * .18;
      const radius = Math.max(.45, p.size * perspective * depthLight * (mobile ? .82 : 1));
      const color = palette[(p.colorIndex + colorStep) % palette.length];

      finaleCtx.globalAlpha = p.alpha * flicker * Math.min(1, .22 + progress * 1.25);
      finaleCtx.fillStyle = color;
      finaleCtx.beginPath();
      finaleCtx.arc(px, py, radius, 0, Math.PI * 2);
      finaleCtx.fill();

      if (p.index % 47 === 0) {
        finaleCtx.globalAlpha *= .38;
        finaleCtx.beginPath();
        finaleCtx.arc(px, py, radius * 3.8, 0, Math.PI * 2);
        finaleCtx.fill();
      }
    }

    finaleCtx.restore();
    state.finaleRaf = requestAnimationFrame(drawFinale);
  }

  function showFinaleCopy() {
    if (!state.finaleActive) return;
    finaleCopy?.classList.add("show");
  }

  function showProposal() {
    if (!state.finaleActive || !proposal) return;

    const proposalCfg = getProposalConfig();
    if (proposalCfg.enabled === false) return;

    if (proposalQuestion) {
      proposalQuestion.textContent = proposalCfg.question || "Em đồng ý làm vợ anh không?";
    }
    if (proposalYesBtn) {
      proposalYesBtn.textContent = proposalCfg.yesText || "Có ❤️";
    }
    if (proposalNoBtn) {
      proposalNoBtn.textContent = proposalCfg.noText || "Không";
      proposalNoBtn.disabled = false;
    }
    if (proposalNoMessage) {
      proposalNoMessage.textContent = "";
    }

    document.body.classList.add("proposal-visible");
    document.body.classList.remove("proposal-accepted");
    proposal.classList.add("show");
    proposal.classList.remove("accepted", "show-no-popup");
    proposal.setAttribute("aria-hidden", "false");
    proposalHappyEnd?.setAttribute("aria-hidden", "true");
  }

  function acceptProposal() {
    const proposalCfg = getProposalConfig();
    state.musicWanted = false;
    window.clearTimeout(state.musicRetryTimer);
    if (music) music.pause();

    document.body.classList.add("proposal-accepted");
    proposal?.classList.add("accepted");
    proposalHappyEnd?.setAttribute("aria-hidden", "false");

    if (proposalHappyEnd) {
      const videoFile = proposalCfg.video || "";
      const leftImage = (state.mobile ? proposalCfg.mobileImageLeft : proposalCfg.imageLeft) || proposalCfg.imageLeft || "";
      const rightImage = (state.mobile ? proposalCfg.mobileImageRight : proposalCfg.imageRight) || proposalCfg.imageRight || "";
      const imagesHtml = !videoFile && (leftImage || rightImage)
        ? `
          <div class="proposal-photo-pair" aria-hidden="true">
            ${leftImage ? `<img class="proposal-photo proposal-photo-left" src="${leftImage}" alt="" />` : ""}
            ${rightImage ? `<img class="proposal-photo proposal-photo-right" src="${rightImage}" alt="" />` : ""}
          </div>
        `
        : "";
      proposalHappyEnd.innerHTML = `
        <div class="love-solar-system" aria-hidden="true">
          <i class="love-orbit love-orbit-a"><b>❤</b></i>
          <i class="love-orbit love-orbit-b"><b>❤</b></i>
          <i class="love-orbit love-orbit-c"><b>❤</b></i>
          <i class="love-orbit love-orbit-d"><b>❤</b></i>
          <i class="love-orbit love-orbit-e"><b>❤</b></i>
          <i class="love-orbit love-orbit-f"><b>❤</b></i>
        </div>
        <div class="love-ground-system" aria-hidden="true">
          <i class="ground-orbit ground-orbit-a"><b>❤</b></i>
          <i class="ground-orbit ground-orbit-b"><b>❤</b></i>
          <i class="ground-orbit ground-orbit-c"><b>❤</b></i>
          <i class="ground-orbit ground-orbit-d"><b>❤</b></i>
        </div>
        ${imagesHtml}
        <span>${proposalCfg.happyLine1 || "Mãi bên nhau"}</span>
        <strong>${proposalCfg.happyLine2 || "Viên mãn ❤️"}</strong>
        <button class="replay-btn proposal-replay-btn" type="button">${getFinaleConfig().replayText || "XEM LẠI ❤️"}</button>
      `;
      if (proposalVideo && proposalCfg.video) {
        proposalVideo.hidden = false;
        proposalVideo.src = proposalCfg.video;
        proposalVideo.muted = Boolean(proposalCfg.videoMuted);
        proposalVideo.loop = Boolean(proposalCfg.videoLoop);
        try { proposalVideo.currentTime = 0; } catch (_) {}
        proposalVideo.play().catch(() => {});
      }
      proposalHappyEnd.querySelector(".proposal-replay-btn")?.addEventListener("click", replayExperience, { once: true });
    }

    scheduleBirthdayFinale();
  }

  function rejectProposal() {
    const proposalCfg = getProposalConfig();
    state.musicWanted = false;
    window.clearTimeout(state.musicRetryTimer);
    if (music) music.pause();

    if (proposalNoMessage) {
      proposalNoMessage.textContent = proposalCfg.noMessage || "Rất tiếc, không cũng phải làm vợ anh ❤️";
    }
    proposal?.classList.add("show-no-popup");
    if (proposalNoBtn) proposalNoBtn.disabled = true;

    window.setTimeout(acceptProposal, 3000);
  }

  function clearBirthdayFinale() {
    window.clearTimeout(state.birthdayFinaleTimer);
    state.birthdayFinaleTimer = 0;
    stopBirthdayFinalMusic();
    for (const timer of state.birthdayFireworkTimers) {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    }
    state.birthdayFireworkTimers = [];
    birthdayFinale?.classList.remove("show");
    birthdayFinale?.setAttribute("aria-hidden", "true");
    if (birthdayFireworks) birthdayFireworks.innerHTML = "";
  }

  function createFinalFirework(x, y) {
    if (!birthdayFireworks) return;

    const colors = ["#ff6fae", "#ffd66f", "#8de8ff", "#c58cff", "#ff8a6b", "#fff3c4"];
    const pieces = state.mobile ? 18 : 28;
    const burst = document.createElement("div");
    burst.className = "birthday-final-burst";
    burst.style.left = `${x}%`;
    burst.style.top = `${y}%`;
    burst.style.setProperty("--burst-color", pick(colors));
    burst.innerHTML = `<i></i>`;

    for (let i = 0; i < pieces; i++) {
      const spark = document.createElement("span");
      const t = (Math.PI * 2 * i) / pieces + rnd(-.08, .08);
      const heartX = 16 * Math.pow(Math.sin(t), 3);
      const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      const scale = rnd(state.mobile ? 5.2 : 7.2, state.mobile ? 7.2 : 10.2);
      spark.style.setProperty("--spark-x", `${heartX * scale}px`);
      spark.style.setProperty("--spark-y", `${heartY * scale}px`);
      spark.style.setProperty("--spark-color", pick(colors));
      spark.style.setProperty("--spark-delay", `${rnd(0, .16).toFixed(2)}s`);
      spark.style.setProperty("--spark-size", `${rnd(state.mobile ? 4 : 5, state.mobile ? 7 : 9).toFixed(1)}px`);
      burst.appendChild(spark);
    }

    birthdayFireworks.appendChild(burst);
    window.setTimeout(() => burst.remove(), 1800);
  }

  function stopBirthdayFinalMusic() {
    for (const timer of state.birthdayMelodyTimers) {
      window.clearTimeout(timer);
    }
    state.birthdayMelodyTimers = [];
    if (state.birthdayAudioCtx) {
      state.birthdayAudioCtx.close().catch(() => {});
      state.birthdayAudioCtx = null;
    }
  }

  function playBirthdayMelody(volume = .45) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    stopBirthdayFinalMusic();
    const ctx = new AudioCtx();
    state.birthdayAudioCtx = ctx;

    const notes = [
      ["G4", .22], ["G4", .22], ["A4", .44], ["G4", .44], ["C5", .44], ["B4", .80],
      ["G4", .22], ["G4", .22], ["A4", .44], ["G4", .44], ["D5", .44], ["C5", .80],
      ["G4", .22], ["G4", .22], ["G5", .44], ["E5", .44], ["C5", .44], ["B4", .44], ["A4", .72],
      ["F5", .22], ["F5", .22], ["E5", .44], ["C5", .44], ["D5", .44], ["C5", .92]
    ];
    const freqs = {
      A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G4: 392, G5: 783.99
    };

    let time = ctx.currentTime + .12;
    for (const [note, duration] of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freqs[note] || 440;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume * .18, time + .03);
      gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration + .04);
      time += duration + .05;
    }

    const closeDelay = Math.max(1000, (time - ctx.currentTime + .5) * 1000);
    state.birthdayMelodyTimers.push(window.setTimeout(stopBirthdayFinalMusic, closeDelay));
  }

  function playBirthdayFinalMusic() {
    const finalBirthday = getBirthdayFinaleConfig();
    if (finalBirthday.musicFile) {
      state.musicWanted = true;
      setMusicTrack(finalBirthday.musicFile, true);
      if (music) {
        music.volume = Math.max(0, Math.min(1, Number(finalBirthday.musicVolume ?? .45)));
      }
      tryPlayMusic();
      return;
    }

    if (finalBirthday.useMelody !== false) {
      playBirthdayMelody(Number(finalBirthday.musicVolume ?? .45));
    }
  }

  function showBirthdayFinale() {
    const finalBirthday = getBirthdayFinaleConfig();
    if (finalBirthday.enabled === false || !birthdayFinale) return;

    proposal?.classList.remove("show");
    birthdayFinale.classList.add("show");
    birthdayFinale.setAttribute("aria-hidden", "false");
    playBirthdayFinalMusic();
    if (birthdayFinalTitle) birthdayFinalTitle.textContent = finalBirthday.title || "Chúc mừng sinh nhật vợ yêu ❤️";
    if (birthdayFinalMessage) birthdayFinalMessage.textContent = finalBirthday.message || "Chúc em luôn hạnh phúc, bình an và mãi bên anh.";
    if (birthdayFinalReplayBtn) birthdayFinalReplayBtn.textContent = getFinaleConfig().replayText || "XEM LẠI ❤️";

    const proposalCfg = getProposalConfig();
    const leftPhoto = (state.mobile ? proposalCfg.mobileImageLeft : proposalCfg.imageLeft) || proposalCfg.imageLeft || "";
    const rightPhoto = (state.mobile ? proposalCfg.mobileImageRight : proposalCfg.imageRight) || proposalCfg.imageRight || "";
    if (birthdayFinalPhotoLeft) {
      birthdayFinalPhotoLeft.src = leftPhoto;
      birthdayFinalPhotoLeft.hidden = !leftPhoto;
    }
    if (birthdayFinalPhotoRight) {
      birthdayFinalPhotoRight.src = rightPhoto;
      birthdayFinalPhotoRight.hidden = !rightPhoto;
    }

    const count = state.mobile
      ? Number(finalBirthday.mobileFireworkCount ?? 5)
      : Number(finalBirthday.fireworkCount ?? 8);
    const burstCount = state.mobile
      ? Number(finalBirthday.mobileFireworkBurstCount ?? 1)
      : Number(finalBirthday.fireworkBurstCount ?? 3);
    const positions = [
      [20, 28], [78, 25], [50, 20], [28, 58],
      [72, 60], [42, 42], [60, 38], [50, 72]
    ];
    const createFireworkBurst = (x, y) => {
      const safeBurstCount = Math.max(1, Math.min(state.mobile ? 1 : 4, burstCount || 1));
      for (let j = 0; j < safeBurstCount; j++) {
        const offsetX = j === 0 ? 0 : rnd(-14, 14);
        const offsetY = j === 0 ? 0 : rnd(-10, 10);
        createFinalFirework(
          Math.max(8, Math.min(92, x + offsetX)),
          Math.max(12, Math.min(76, y + offsetY))
        );
      }
    };

    for (let i = 0; i < count; i++) {
      const pos = positions[i % positions.length];
      state.birthdayFireworkTimers.push(window.setTimeout(() => {
        createFireworkBurst(pos[0] + rnd(-5, 5), pos[1] + rnd(-4, 4));
      }, i * 420));
    }

    const interval = window.setInterval(() => {
      createFireworkBurst(rnd(16, 84), rnd(18, 68));
    }, state.mobile ? 1700 : 1250);
    state.birthdayFireworkTimers.push(interval);
  }

  function scheduleBirthdayFinale() {
    const finalBirthday = getBirthdayFinaleConfig();
    window.clearTimeout(state.birthdayFinaleTimer);
    if (finalBirthday.enabled === false) return;

    const showAfter = Math.max(1000, Number(finalBirthday.showAfter ?? 10000));
    state.birthdayFinaleTimer = window.setTimeout(showBirthdayFinale, showAfter);
  }

  function startFinale() {
    const finalCfg = getFinaleConfig();
    if (state.finalizing || finalCfg.enabled === false || !finale) return;

    state.finalizing = true;
    state.running = false;
    clearFallTimers();
    clearBirthdayTimers();
    stopSceneHeart();
    if (fallLayer) fallLayer.innerHTML = "";

    sceneWrap.classList.add("ending");
    document.body.classList.add("finale-active");
    document.body.classList.remove("proposal-visible", "proposal-accepted");
    finale.classList.add("show");
    finale.setAttribute("aria-hidden", "false");
    finaleCopy?.classList.remove("show");
    setMusicTrack(finalCfg.musicFile || cfg.finaleMusicFile || cfg.musicFile, true);
    tryPlayMusic();
    scheduleMusicRetry(650);

    if (finaleTitle) {
      const title = finalCfg.title || `${cfg.personA || ""} ❤️ ${cfg.personB || ""}`;
      const parts = title.split("❤️").map(part => part.trim()).filter(Boolean);
      if (parts.length >= 2) {
        finaleTitle.innerHTML = `
          <span class="finale-line finale-line-a">${parts[0]}</span>
          <span class="finale-line finale-line-heart">❤️</span>
          <span class="finale-line finale-line-b">${parts.slice(1).join(" ❤️ ")}</span>
        `;
      } else {
        finaleTitle.textContent = title;
      }
    }
    if (finaleMessage) finaleMessage.textContent = finalCfg.message || "Cảm ơn em đã xuất hiện trong cuộc đời anh ❤️";
    if (finalePhoto) {
      const activeImages = getFallImages();
      const photo = (state.mobile ? finalCfg.mobilePhoto : finalCfg.photo) || finalCfg.photo || activeImages[0] || "";
      finalePhoto.src = photo;
      finalePhoto.hidden = !photo;
    }
    if (replayBtn) {
      replayBtn.textContent = finalCfg.replayText || "XEM LẠI ❤️";
      replayBtn.hidden = finalCfg.showReplayButton === false;
    }
    proposal?.classList.remove("show", "accepted");
    proposal?.setAttribute("aria-hidden", "true");
    proposalHappyEnd?.setAttribute("aria-hidden", "true");

    state.finaleActive = true;

    const assembleDuration = Math.max(1200, Number(finalCfg.assembleDuration ?? 6000));
    if (state.mobile) {
      startMobileHeartFinale();
      state.finaleMessageTimer = window.setTimeout(showFinaleCopy, 550);
    } else if (!finaleCanvas || !finaleCtx) {
      state.finaleStart = performance.now();
      state.finaleMessageTimer = window.setTimeout(showFinaleCopy, 550);
    } else {
      resizeFinaleCanvas();
      buildFinaleParticles();
      state.finaleStart = performance.now();
      state.finaleRaf = requestAnimationFrame(drawFinale);
      state.finaleMessageTimer = window.setTimeout(showFinaleCopy, assembleDuration * .82);
    }

    const autoReplayAfter = Number(finalCfg.autoReplayAfter || 0);
    if (autoReplayAfter > 0) {
      state.finaleReplayTimer = window.setTimeout(replayExperience, assembleDuration + autoReplayAfter);
    }

    const proposalCfg = getProposalConfig();
    const proposalAfter = Number(proposalCfg.showAfter ?? 0);
    window.clearTimeout(state.proposalTimer);
    if (proposalCfg.enabled !== false && proposalAfter > 0) {
      state.proposalTimer = window.setTimeout(showProposal, proposalAfter);
    }
  }

  function scheduleFinale() {
    window.clearTimeout(state.finaleTimer);
    const finalCfg = getFinaleConfig();
    if (finalCfg.enabled === false) return;

    const startAfter = Math.max(1000, Number(finalCfg.startAfter ?? 30000));
    state.finaleTimer = window.setTimeout(startFinale, startAfter);
  }

  function stopFinale() {
    window.clearTimeout(state.finaleTimer);
    window.clearTimeout(state.finaleMessageTimer);
    window.clearTimeout(state.proposalTimer);
    clearBirthdayFinale();
    window.clearTimeout(state.finaleReplayTimer);
    cancelAnimationFrame(state.finaleRaf);
    state.finaleTimer = 0;
    state.finaleMessageTimer = 0;
    state.proposalTimer = 0;
    state.finaleReplayTimer = 0;
    state.finaleRaf = 0;
    state.finaleActive = false;
    state.finalizing = false;
    state.finaleParticles = [];
    document.body.classList.remove("proposal-visible", "proposal-accepted");
    finaleCopy?.classList.remove("show");
    proposal?.classList.remove("show", "accepted");
    proposal?.setAttribute("aria-hidden", "true");
    proposalHappyEnd?.setAttribute("aria-hidden", "true");
    if (proposalVideo) {
      proposalVideo.pause();
      proposalVideo.hidden = true;
      proposalVideo.removeAttribute("src");
      proposalVideo.load();
    }
    finale?.classList.remove("show");
    finale?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("finale-active");
    if (finaleCtx) finaleCtx.clearRect(0, 0, state.finaleViewport.width, state.finaleViewport.height);
  }

  function replayExperience() {
    stopFinale();
    setMusicTrack(cfg.musicFile, true);
    sceneWrap.classList.remove("ending");
    sceneWrap.classList.add("show");
    sceneWrap.setAttribute("aria-hidden", "false");
    buildParticles();
    state.running = true;
    state.musicWanted = true;
    state.last = performance.now();
    startSceneHeart();
    startFallingEffects();
    startBirthdayEffects();
    scheduleFinale();
  }

  async function tryPlayMusic() {
    if (!music) return;

    try {
      music.volume = Math.max(0, Math.min(1, Number(cfg.musicVolume ?? .62)));
      music.muted = false;
      music.loop = true;

      if (!state.musicReady) {
        if (!music.getAttribute("src") && state.currentMusicFile) {
          music.src = state.currentMusicFile;
        }
        music.load();
        state.musicReady = true;
      }

      await music.play();
      state.muted = false;
      soundBtn?.classList.remove("muted");
      if (soundBtn) soundBtn.textContent = "♫";
    } catch (_) {
      state.muted = true;
      soundBtn?.classList.add("muted");
      if (soundBtn) soundBtn.textContent = "×";
      scheduleMusicRetry(900);
    }
  }

  function setMusicTrack(file, reset = false) {
    if (!music || !file) return;

    const current = music.getAttribute("src") || "";
    const shouldSwap = current !== file;

    if (shouldSwap) {
      music.pause();
      music.src = file;
      state.currentMusicFile = file;
      state.musicReady = false;
      reset = true;
    }

    if (reset) {
      try {
        music.currentTime = 0;
      } catch (_) {}
    }
  }

  function scheduleMusicRetry(delay = 700) {
    if (!state.musicWanted || !music) return;
    window.clearTimeout(state.musicRetryTimer);
    state.musicRetryTimer = window.setTimeout(() => {
      if (state.musicWanted && music.paused) {
        tryPlayMusic();
      }
    }, delay);
  }

  async function startExperience() {
    if (state.running || state.finalizing) return;

    state.running = true;
    state.musicWanted = true;
    setMusicTrack(cfg.musicFile, true);
    stopOpeningHeart();
    startScreen?.classList.add("hide");
    sceneWrap?.classList.add("show");
    sceneWrap?.setAttribute("aria-hidden", "false");

    startSceneHeart();
    startFallingEffects();
    startBirthdayEffects();
    scheduleFinale();
    tryPlayMusic();

    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch (_) {}
    }
  }

  startBtn?.addEventListener("click", startExperience);

  function autoStartCountdown() {
    if (!startBtn) return;

    startBtn.disabled = false;
    startBtn.setAttribute("aria-label", "Mở quà");
  }

  function bindMusicEvents(el) {
    if (!el) return;
    el.addEventListener("pause", () => scheduleMusicRetry(450));
    el.addEventListener("stalled", () => scheduleMusicRetry(900));
    el.addEventListener("waiting", () => scheduleMusicRetry(1200));
    el.addEventListener("ended", () => {
      if (!state.musicWanted) return;
      try { el.currentTime = 0; } catch (_) {}
      scheduleMusicRetry(120);
    });
  }

  bindMusicEvents(music);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) scheduleMusicRetry(250);
  });

  replayBtn?.addEventListener("click", replayExperience);
  proposalYesBtn?.addEventListener("click", acceptProposal);
  proposalNoBtn?.addEventListener("click", rejectProposal);
  birthdayFinalReplayBtn?.addEventListener("click", replayExperience);

  window.addEventListener("resize", () => {
    state.mobile = isMobileLike();
    if (state.startHeartActive) resizeStartHeartCanvas();
    if (state.sceneHeartActive) resizeSceneHeartCanvas();
    if (state.finaleActive) {
      resizeFinaleCanvas();
    } else {
      buildParticles();
    }
  });

  buildStars();
  buildParticles();
  startOpeningHeart();
  autoStartCountdown();
  requestAnimationFrame(loop);
})();
