const STORAGE_KEY = "opdrachten";

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();
  wireCharCount();
});

/* ---------- Storage ---------- */
function getOpdrachten() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}
function setOpdrachten(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/* ---------- Create ---------- */
function opslaan() {
  const titel = document.getElementById("titel")?.value.trim();
  const locatie = document.getElementById("locatie")?.value.trim();
  const beschrijving = document.getElementById("beschrijving")?.value.trim();
  const msg = document.getElementById("msg");

  if (!titel || !locatie || !beschrijving) {
    if (msg) {
      msg.textContent = "Vul alle velden in.";
      msg.classList.add("show", "error");
    }
    return;
  }

  const opdracht = {
    id: cryptoRandomId(),
    titel,
    locatie,
    beschrijving,
    createdAt: new Date().toISOString()
  };

  const data = getOpdrachten();
  data.unshift(opdracht);
  setOpdrachten(data);

  if (msg) {
    msg.textContent = "✅ Opdracht geplaatst! Bekijk ‘Opdrachten’ om hem te zien.";
    msg.classList.add("show");
    msg.classList.remove("error");
  }

  // reset
  document.getElementById("titel").value = "";
  document.getElementById("locatie").value = "";
  document.getElementById("beschrijving").value = "";
  wireCharCount(true);

  // kleine UX: scroll naar feedback
  msg?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------- List + Filter + Sort ---------- */
function toonOpdrachten(filterText = "", sortMode = "newest") {
  const lijst = document.getElementById("lijst");
  const empty = document.getElementById("empty");
  const count = document.getElementById("count");
  if (!lijst) return;

  lijst.innerHTML = "";
  const q = filterText.trim().toLowerCase();

  let data = getOpdrachten().filter(o => {
    if (!q) return true;
    return (
      o.titel.toLowerCase().includes(q) ||
      o.locatie.toLowerCase().includes(q) ||
      o.beschrijving.toLowerCase().includes(q)
    );
  });

  data = sortOpdrachten(data, sortMode);

  if (count) count.textContent = `${data.length} opdracht${data.length === 1 ? "" : "en"}`;

  if (data.length === 0) {
    if (empty) empty.classList.remove("hidden");
    return;
  } else {
    if (empty) empty.classList.add("hidden");
  }

  data.forEach(o => {
    const li = document.createElement("li");
    li.className = "item";

    li.innerHTML = `
      <div class="item-head">
        <div class="item-main">
          <div class="item-title">${escapeHtml(o.titel)}</div>
          <div class="item-meta">
            <span class="badge">${escapeHtml(o.locatie)}</span>
            <span class="muted small">• ${formatDate(o.createdAt)}</span>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-primary btn-sm" data-id="${o.id}" data-action="interest">Interesse</button>
          <button class="btn btn-ghost btn-sm" data-id="${o.id}" data-action="remove">Verwijder</button>
        </div>
      </div>

      <p class="item-desc">${escapeHtml(o.beschrijving)}</p>
    `;

    lijst.appendChild(li);
  });

  // Event delegation (once)
  lijst.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "interest") {
      toast("✅ Interesse (demo). Later koppelen we contact of chat.");
    }

    if (action === "remove") {
      const ok = confirm("Opdracht verwijderen?");
      if (!ok) return;
      const newData = getOpdrachten().filter(x => x.id !== id);
      setOpdrachten(newData);

      const searchVal = document.getElementById("search")?.value || "";
      const sortVal = document.getElementById("sort")?.value || "newest";
      toonOpdrachten(searchVal, sortVal);
    }
  }, { once: true });
}

function sortOpdrachten(data, mode) {
  const copy = [...data];
  if (mode === "newest") return copy.sort((a,b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  if (mode === "oldest") return copy.sort((a,b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
  if (mode === "title") return copy.sort((a,b) => a.titel.localeCompare(b.titel, "nl"));
  if (mode === "location") return copy.sort((a,b) => a.locatie.localeCompare(b.locatie, "nl"));
  return copy;
}

/* ---------- Demo ---------- */
function addDemoOpdracht() {
  const demo = {
    id: cryptoRandomId(),
    titel: "Koerier gezocht voor 2 stops",
    locatie: "Eindhoven",
    beschrijving: "Ophalen Strijp-S, afleveren Eindhoven Airport. Vandaag voor 16:00.",
    createdAt: new Date().toISOString()
  };
  const data = getOpdrachten();
  data.unshift(demo);
  setOpdrachten(data);
  toast("✨ Demo opdracht toegevoegd");
}

/* ---------- UX helpers ---------- */
function highlightActiveNav() {
  const page = document.body.getAttribute("data-page");
  if (!page) return;

  document.querySelectorAll(".nav-link[data-link]").forEach(a => {
    if (a.getAttribute("data-link") === page) a.classList.add("active");
  });
}

function wireCharCount(forceUpdate = false) {
  const textarea = document.getElementById("beschrijving");
  const counter = document.getElementById("charCount");
  if (!textarea || !counter) return;

  const update = () => {
    counter.textContent = `${textarea.value.length}/240`;
  };

  if (forceUpdate) update();

  textarea.addEventListener("input", update);
  update();
}

function toast(text) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

/* ---------- Utils ---------- */
function cryptoRandomId() {
  if (window.crypto && crypto.getRandomValues) {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    return arr[0].toString(16) + arr[1].toString(16);
  }
  return Math.random().toString(16).slice(2);
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
