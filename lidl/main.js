const STORAGE_KEY = "lidl_pallet_split_v5_units_milk_freezer";

/**
 * type:
 *  - "epdp": Delivery/Back each have EP + DP
 *  - "unit": Delivery/Back each have ONE unit count (e.g. Cases, TKT)
 */
const SECTIONS = [
  {
    key: "ambientMixes",
    label: "Ambient Mixes",
    type: "epdp",
    epMin: 45,
    dpMult: 0.5,
    splittable: true,
  },
  {
    key: "ambientBulks",
    label: "Ambient Bulks",
    type: "epdp",
    epMin: 10,
    dpMult: 1.0,
    splittable: false,
  }, // DP same as EP
  {
    key: "bread",
    label: "Bread & Cakes",
    type: "epdp",
    epMin: 15,
    dpMult: 0.5,
    splittable: false,
  },
  {
    key: "fv",
    label: "F&V",
    type: "epdp",
    epMin: 30,
    dpMult: 0.5,
    splittable: false,
  },
  {
    key: "flowers",
    label: "Plants & Flowers",
    type: "epdp",
    epMin: 15,
    dpMult: 0.5,
    splittable: false,
  },
  {
    key: "nonFoodPromo",
    label: "Non-Food Promotion",
    type: "epdp",
    epMin: 35,
    dpMult: 0.5,
    splittable: false,
  },

  // Milk: unit = Cases, 15 min per case
  {
    key: "milk",
    label: "Milk",
    type: "unit",
    unitLabel: "Cases",
    unitMin: 15,
    splittable: false,
  },

  {
    key: "chiller",
    label: "Chiller",
    type: "epdp",
    epMin: 40,
    dpMult: 0.5,
    splittable: false,
  },
  {
    key: "chillConv",
    label: "Chill Convenience",
    type: "epdp",
    epMin: 20,
    dpMult: 0.5,
    splittable: false,
  },

  // Freezer: unit = TKT, 35 min per TKT
  {
    key: "freezer",
    label: "Freezer (TKT)",
    type: "unit",
    unitLabel: "TKT",
    unitMin: 35,
    splittable: false,
  },

  {
    key: "mp",
    label: "M&P",
    type: "epdp",
    epMin: 40,
    dpMult: 0.5,
    splittable: false,
  },
];

const PRIORITY_A = ["fv", "chillConv", "bread", "flowers", "ambientBulks"];
const MIX_KEY = "ambientMixes";

let state = defaultState();
let stepIndex = 0;

const el = {
  wizard: document.getElementById("wizard"),
  results: document.getElementById("results"),
  editor: document.getElementById("editor"),

  stepPill: document.getElementById("stepPill"),
  stepTitle: document.getElementById("stepTitle"),
  stepHint: document.getElementById("stepHint"),
  wizardBody: document.getElementById("wizardBody"),

  backBtn: document.getElementById("backBtn"),
  nextBtn: document.getElementById("nextBtn"),

  summary: document.getElementById("summary"),
  peopleCards: document.getElementById("peopleCards"),
  editBtn: document.getElementById("editBtn"),
  clearResultsBtn: document.getElementById("clearResultsBtn"),
  clearResultsTopBtn: document.getElementById("clearResultsTopBtn"),

  editorBody: document.getElementById("editorBody"),
  saveRecalcBtn: document.getElementById("saveRecalcBtn"),
};

const STEPS = [
  { type: "workers" },
  ...SECTIONS.map((s) => ({ type: "section", key: s.key })),
];

boot();

function boot() {
  wireEvents();

  const saved = loadSaved();
  if (saved) {
    state = sanitizeState(saved);
    showResults();
  } else {
    state = defaultState();
    stepIndex = 0;
    showWizard();
  }
}

/* ---------- Views ---------- */
function showWizard() {
  el.wizard.classList.remove("hidden");
  el.results.classList.add("hidden");
  el.editor.classList.add("hidden");
  toggleClearButtons();
  renderWizardStep();
}

function showResults() {
  el.wizard.classList.add("hidden");
  el.results.classList.remove("hidden");
  el.editor.classList.add("hidden");

  state = sanitizeState(state);
  saveState(state);
  toggleClearButtons();

  const out = distributeByMinutes(state);
  renderResults(out);
}

function showEditor() {
  el.wizard.classList.add("hidden");
  el.results.classList.add("hidden");
  el.editor.classList.remove("hidden");

  toggleClearButtons();
  renderEditor();
}

function toggleClearButtons() {
  const hasSaved = Boolean(localStorage.getItem(STORAGE_KEY));
  el.clearResultsTopBtn.classList.toggle("hidden", !hasSaved);
}

/* ---------- Wizard rendering ---------- */
function renderWizardStep() {
  const step = STEPS[stepIndex];
  el.stepPill.textContent = `Step ${stepIndex + 1} / ${STEPS.length}`;
  el.backBtn.disabled = stepIndex === 0;
  el.wizardBody.innerHTML = "";

  if (step.type === "workers") {
    el.stepTitle.textContent = "Workers";
    el.stepHint.textContent = "How many people are working tonight?";

    const wrap = document.createElement("div");
    wrap.className = "center";
    wrap.appendChild(
      makeStepper({
        label: "Workers",
        value: state.workers ?? 0,
        min: 0,
        onChange: (v) => (state.workers = v),
      })
    );
    el.wizardBody.appendChild(wrap);
    setTimeout(() => wrap.querySelector("input")?.focus(), 0);
    return;
  }

  const sec = sectionByKey(step.key);
  el.stepTitle.textContent = sec.label;
  el.stepHint.textContent =
    sec.type === "unit"
      ? `Enter Delivery + Backstock (${sec.unitLabel}).`
      : "Enter Delivery + Backstock (EP/DP).";

  const grid = document.createElement("div");
  grid.className = "section-grid";
  grid.appendChild(makeSectionBlock(sec.key, "Delivery", "delivery"));
  grid.appendChild(makeSectionBlock(sec.key, "Backstock", "back"));

  el.wizardBody.appendChild(grid);
  setTimeout(() => grid.querySelector("input")?.focus(), 0);
}

function makeSectionBlock(sectionKey, title, mode) {
  const sec = sectionByKey(sectionKey);

  const block = document.createElement("div");
  block.className = "section-block";

  const h = document.createElement("h3");
  h.textContent = title;
  block.appendChild(h);

  if (sec.type === "unit") {
    const row = document.createElement("div");
    row.className = "two-col";
    row.style.gridTemplateColumns = "1fr";

    row.appendChild(
      makeStepper({
        label: sec.unitLabel,
        value: state.sections[sectionKey][mode].units,
        min: 0,
        onChange: (v) => (state.sections[sectionKey][mode].units = v),
      })
    );

    block.appendChild(row);
    return block;
  }

  const row = document.createElement("div");
  row.className = "two-col";

  row.appendChild(
    makeStepper({
      label: "EP",
      value: state.sections[sectionKey][mode].ep,
      min: 0,
      onChange: (v) => (state.sections[sectionKey][mode].ep = v),
    })
  );

  row.appendChild(
    makeStepper({
      label: "DP",
      value: state.sections[sectionKey][mode].dp,
      min: 0,
      onChange: (v) => (state.sections[sectionKey][mode].dp = v),
    })
  );

  block.appendChild(row);
  return block;
}

function makeStepper({ label, value, min, onChange }) {
  const wrap = document.createElement("div");
  wrap.className = "stepper";

  const lab = document.createElement("label");
  lab.textContent = label;

  const row = document.createElement("div");
  row.className = "stepper-row";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.className = "btn ghost mini";
  minus.textContent = "−";

  const inp = document.createElement("input");
  inp.type = "number";
  inp.inputMode = "numeric";
  inp.min = String(min ?? 0);
  inp.value = String(value ?? 0);

  const plus = document.createElement("button");
  plus.type = "button";
  plus.className = "btn ghost mini";
  plus.textContent = "+";

  const setVal = (v) => {
    const vv = Math.max(min ?? 0, Math.floor(Number(v) || 0));
    inp.value = String(vv);
    onChange(vv);
  };

  minus.addEventListener("click", () => setVal((Number(inp.value) || 0) - 1));
  plus.addEventListener("click", () => setVal((Number(inp.value) || 0) + 1));
  inp.addEventListener("input", () => setVal(inp.value));
  inp.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setVal((Number(inp.value) || 0) + 1);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setVal((Number(inp.value) || 0) - 1);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      nextStep();
    }
  });

  row.appendChild(minus);
  row.appendChild(inp);
  row.appendChild(plus);

  wrap.appendChild(lab);
  wrap.appendChild(row);
  return wrap;
}

/* ---------- Editor rendering (same layout, all sections) ---------- */
function renderEditor() {
  el.editorBody.innerHTML = "";

  const list = document.createElement("div");
  list.className = "editor-list";

  const workersCard = document.createElement("div");
  workersCard.className = "editor-section";
  workersCard.innerHTML = `<h3>Workers</h3>`;
  const workersWrap = document.createElement("div");
  workersWrap.className = "center";
  workersWrap.appendChild(
    makeStepper({
      label: "Workers",
      value: state.workers ?? 0,
      min: 0,
      onChange: (v) => (state.workers = v),
    })
  );
  workersCard.appendChild(workersWrap);
  list.appendChild(workersCard);

  for (const sec of SECTIONS) {
    const card = document.createElement("div");
    card.className = "editor-section";
    const h = document.createElement("h3");
    h.textContent = sec.label;
    card.appendChild(h);

    const grid = document.createElement("div");
    grid.className = "section-grid";
    grid.appendChild(makeSectionBlock(sec.key, "Delivery", "delivery"));
    grid.appendChild(makeSectionBlock(sec.key, "Backstock", "back"));
    card.appendChild(grid);

    list.appendChild(card);
  }

  el.editorBody.appendChild(list);
  setTimeout(() => el.editorBody.querySelector("input")?.focus(), 0);
}

/* ---------- Events ---------- */
function wireEvents() {
  el.backBtn.addEventListener("click", () => {
    stepIndex = Math.max(0, stepIndex - 1);
    renderWizardStep();
  });

  el.nextBtn.addEventListener("click", () => nextStep());

  el.editBtn.addEventListener("click", () => showEditor());

  el.clearResultsBtn.addEventListener("click", clearResults);
  el.clearResultsTopBtn.addEventListener("click", clearResults);

  // Save triggers recalculation (and saves)
  el.saveRecalcBtn.addEventListener("click", () => showResults());
}

function nextStep() {
  if (stepIndex < STEPS.length - 1) {
    stepIndex += 1;
    renderWizardStep();
  } else {
    showResults();
  }
}

function clearResults() {
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  stepIndex = 0;
  showWizard();
}

/* ---------- Storage ---------- */
function saveState(s) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...s, _savedAt: new Date().toISOString() })
  );
}
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/* ---------- State helpers ---------- */
function defaultState() {
  const sections = {};
  for (const s of SECTIONS) {
    if (s.type === "unit") {
      sections[s.key] = {
        delivery: { units: 0 },
        back: { units: 0 },
      };
    } else {
      sections[s.key] = {
        delivery: { ep: 0, dp: 0 },
        back: { ep: 0, dp: 0 },
      };
    }
  }
  return { workers: 0, sections };
}

function sanitizeState(s) {
  const out = defaultState();
  out.workers = Math.max(1, Math.floor(Number(s?.workers) || 0));

  for (const sec of SECTIONS) {
    if (sec.type === "unit") {
      for (const mode of ["delivery", "back"]) {
        out.sections[sec.key][mode].units = Math.max(
          0,
          Math.floor(Number(s?.sections?.[sec.key]?.[mode]?.units) || 0)
        );
      }
    } else {
      for (const mode of ["delivery", "back"]) {
        out.sections[sec.key][mode].ep = Math.max(
          0,
          Math.floor(Number(s?.sections?.[sec.key]?.[mode]?.ep) || 0)
        );
        out.sections[sec.key][mode].dp = Math.max(
          0,
          Math.floor(Number(s?.sections?.[sec.key]?.[mode]?.dp) || 0)
        );
      }
    }
  }
  return out;
}

function sectionByKey(key) {
  const s = SECTIONS.find((x) => x.key === key);
  if (!s) throw new Error("Unknown section: " + key);
  return s;
}

function minutesFor(secKey, modeObj) {
  const s = sectionByKey(secKey);

  if (s.type === "unit") {
    const units = Number(modeObj.units || 0);
    return units * s.unitMin;
  }

  const ep = Number(modeObj.ep || 0);
  const dp = Number(modeObj.dp || 0);
  return ep * s.epMin + dp * s.epMin * s.dpMult;
}

/* ---------- Distribution (minutes-based) ---------- */
function distributeByMinutes(inputs) {
  const workers = Math.max(1, inputs.workers || 1);
  const people = makePeople(workers);

  // bundles per section: back+delivery
  const bundles = {};
  for (const sec of SECTIONS) {
    const d = inputs.sections[sec.key].delivery;
    const b = inputs.sections[sec.key].back;

    const backMin = minutesFor(sec.key, b);
    const delMin = minutesFor(sec.key, d);
    const totalMin = backMin + delMin;

    bundles[sec.key] = {
      key: sec.key,
      label: sec.label,
      type: sec.type,
      unitLabel: sec.unitLabel,
      splittable: sec.splittable,
      back: { ...b, minutes: backMin },
      delivery: { ...d, minutes: delMin },
      minutes: totalMin,
    };
  }

  const totalMinutes = Object.values(bundles).reduce(
    (sum, x) => sum + x.minutes,
    0
  );
  const target = totalMinutes / workers;

  const A = people[0];
  const nonAIdx = Array.from(
    { length: Math.max(0, workers - 1) },
    (_, i) => i + 1
  );

  const assignSectionWhole = (pi, secKey) => {
    const p = people[pi];
    const bundle = bundles[secKey];
    if (!bundle || bundle.minutes <= 0) return;

    if (bundle.back.minutes > 0)
      pushLine(p, bundle, "back", bundle.back, bundle.back.minutes);
    if (bundle.delivery.minutes > 0)
      pushLine(p, bundle, "delivery", bundle.delivery, bundle.delivery.minutes);

    p.totalMin += bundle.minutes;

    bundle.minutes = 0;
    bundle.back.minutes = 0;
    bundle.delivery.minutes = 0;
  };

  // 1) Force A owns F&V if any (your rule: Person A always gets F&V backstock first)
  if (bundles.fv?.minutes > 0) assignSectionWhole(0, "fv");

  // 2) Give A additional priority sections if they fit under target
  for (const k of PRIORITY_A) {
    if (k === "fv") continue;
    const b = bundles[k];
    if (!b || b.minutes <= 0) continue;
    if (A.totalMin >= target) break;
    if (A.totalMin + b.minutes <= target) assignSectionWhole(0, k);
  }

  // 3) Non-food promo goes to one person (prefer non-A)
  if (bundles.nonFoodPromo?.minutes > 0) {
    const pool = nonAIdx.length ? nonAIdx : [0];
    assignSectionWhole(lowestMinAmongIndexes(people, pool), "nonFoodPromo");
  }

  // 4) Fresh split heuristic for non-A (keeps sections whole)
  const giveWholeLowestNonA = (key) => {
    if (bundles[key]?.minutes > 0) {
      const pi = nonAIdx.length ? lowestMinAmongIndexes(people, nonAIdx) : 0;
      assignSectionWhole(pi, key);
    }
  };

  if (nonAIdx.length >= 3) {
    // try separate chiller / freezer / mp when enough people
    for (const k of ["chiller", "freezer", "mp", "milk"])
      giveWholeLowestNonA(k);
  } else if (nonAIdx.length === 2) {
    // pair freezer + mp where possible
    if ((bundles.freezer?.minutes || 0) + (bundles.mp?.minutes || 0) > 0) {
      const pi = lowestMinAmongIndexes(people, nonAIdx);
      if (bundles.freezer?.minutes > 0) assignSectionWhole(pi, "freezer");
      if (bundles.mp?.minutes > 0) assignSectionWhole(pi, "mp");
    }
    for (const k of ["chiller", "milk"]) giveWholeLowestNonA(k);
  } else if (nonAIdx.length === 1) {
    const pi = nonAIdx[0];
    for (const k of ["milk", "chiller", "freezer", "mp"]) {
      if (bundles[k]?.minutes > 0) assignSectionWhole(pi, k);
    }
  } else {
    for (const k of ["milk", "chiller", "freezer", "mp"]) {
      if (bundles[k]?.minutes > 0) assignSectionWhole(0, k);
    }
  }

  // 5) Assign remaining sections (except mixes) to the person with the lowest minutes
  for (const sec of SECTIONS) {
    if (sec.key === MIX_KEY) continue;
    if (bundles[sec.key]?.minutes > 0) {
      const pool =
        workers > 1 && people[0].totalMin >= target
          ? nonAIdx
          : Array.from({ length: workers }, (_, i) => i);
      assignSectionWhole(lowestMinAmongIndexes(people, pool), sec.key);
    }
  }

  // 6) Split Ambient Mixes into single EP/DP units to balance totals
  if (bundles[MIX_KEY]) splitAmbientMixes(inputs, people, target);

  return { people, totalMinutes, target };
}

function splitAmbientMixes(inputs, people, target) {
  const sec = sectionByKey(MIX_KEY);
  const unitEpMin = sec.epMin;
  const unitDpMin = sec.epMin * sec.dpMult;

  let backEP = inputs.sections.ambientMixes.back.ep;
  let backDP = inputs.sections.ambientMixes.back.dp;
  let delEP = inputs.sections.ambientMixes.delivery.ep;
  let delDP = inputs.sections.ambientMixes.delivery.dp;

  const pickPool = () =>
    people.length > 1 && people[0].totalMin >= target
      ? people.slice(1)
      : people;

  const giveUnit = (p, kind, isEP) => {
    const minutes = isEP ? unitEpMin : unitDpMin;
    const counts = isEP ? { ep: 1, dp: 0 } : { ep: 0, dp: 1 };
    pushMixLine(p, kind, counts, minutes);
    p.totalMin += minutes;
  };

  // Backstock first
  while (backEP > 0 || backDP > 0) {
    const pool = pickPool();
    const p = pool.reduce(
      (best, cur) => (cur.totalMin < best.totalMin ? cur : best),
      pool[0]
    );
    if (backDP > 0) {
      giveUnit(p, "back", false);
      backDP--;
    } else {
      giveUnit(p, "back", true);
      backEP--;
    }
  }

  // Delivery
  while (delEP > 0 || delDP > 0) {
    const pool = pickPool();
    const p = pool.reduce(
      (best, cur) => (cur.totalMin < best.totalMin ? cur : best),
      pool[0]
    );
    if (delDP > 0) {
      giveUnit(p, "delivery", false);
      delDP--;
    } else {
      giveUnit(p, "delivery", true);
      delEP--;
    }
  }
}

/* ---------- People / lines ---------- */
function makePeople(n) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return Array.from({ length: n }, (_, i) => ({
    name: `Person ${letters[i] || i + 1}`,
    totalMin: 0,
    lines: [], // { sectionLabel, kind, type, unitLabel?, minutes, ep/dp or units }
  }));
}

function pushLine(person, bundleMeta, kind, countsObj, minutes) {
  const line = {
    sectionLabel: bundleMeta.label,
    kind,
    type: bundleMeta.type,
    unitLabel: bundleMeta.unitLabel,
    minutes,
  };

  if (bundleMeta.type === "unit") {
    line.units = Number(countsObj.units || 0);
  } else {
    line.ep = Number(countsObj.ep || 0);
    line.dp = Number(countsObj.dp || 0);
  }

  person.lines.push(line);
}

function pushMixLine(person, kind, countsObj, minutes) {
  // merge for ambient mixes
  const found = person.lines.find(
    (l) =>
      l.sectionLabel === "Ambient Mixes" && l.kind === kind && l.type === "epdp"
  );
  if (found) {
    found.minutes += minutes;
    found.ep += countsObj.ep || 0;
    found.dp += countsObj.dp || 0;
    return;
  }
  person.lines.push({
    sectionLabel: "Ambient Mixes",
    kind,
    type: "epdp",
    minutes,
    ep: countsObj.ep || 0,
    dp: countsObj.dp || 0,
  });
}

function lowestMinAmongIndexes(people, idxs) {
  let best = idxs[0];
  for (const i of idxs)
    if (people[i].totalMin < people[best].totalMin) best = i;
  return best;
}

/* ---------- Render results ---------- */
function renderResults(out) {
  const { people, totalMinutes, target } = out;

  el.summary.innerHTML = `
    <div><strong>Total time:</strong> ${Math.round(totalMinutes)} min</div>
    <div><strong>Target per person:</strong> ${target.toFixed(1)} min</div>
  `;

  el.peopleCards.innerHTML = "";

  for (const p of people) {
    const card = document.createElement("div");
    card.className = "card person-card";

    const delta = p.totalMin - target;

    const header = document.createElement("h3");
    header.innerHTML = `
      <span>${p.name}</span>
      <span class="total">${p.totalMin.toFixed(1)} min (${
      delta >= 0 ? "+" : ""
    }${delta.toFixed(1)})</span>
    `;
    card.appendChild(header);

    const backLines = p.lines.filter((l) => l.kind === "back" && l.minutes > 0);
    const delLines = p.lines.filter(
      (l) => l.kind === "delivery" && l.minutes > 0
    );

    card.appendChild(renderSubgroup("Backstock", backLines));
    card.appendChild(renderSubgroup("Delivery", delLines));

    el.peopleCards.appendChild(card);
  }
}

function renderSubgroup(title, lines) {
  const frag = document.createDocumentFragment();

  const h = document.createElement("div");
  h.className = "subhead";
  h.textContent = title;
  frag.appendChild(h);

  const ul = document.createElement("ul");
  ul.className = "list";

  if (!lines.length) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="k">—</span><span class="v">None</span>`;
    ul.appendChild(li);
  } else {
    lines
      .slice()
      .sort((a, b) => a.sectionLabel.localeCompare(b.sectionLabel))
      .forEach((l) => {
        const li = document.createElement("li");

        let left = l.sectionLabel;
        if (l.type === "unit") {
          left += `<br><span class="v">${l.unitLabel} ${l.units}</span>`;
        } else {
          left += `<br><span class="v">EP ${l.ep} • DP ${l.dp}</span>`;
        }

        li.innerHTML = `<span class="k">${left}</span><span class="v">${l.minutes.toFixed(
          1
        )}m</span>`;
        ul.appendChild(li);
      });
  }

  frag.appendChild(ul);
  return frag;
}
