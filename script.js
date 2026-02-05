const STORAGE_KEY = "opdrachten";

function getOpdrachten() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function setOpdrachten(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function opslaan() {
  const titel = document.getElementById("titel")?.value.trim();
  const locatie = document.getElementById("locatie")?.value.trim();
  const beschrijving = document.getElementById("beschrijving")?.value.trim();
  const msg = document.getElementById("msg");

  if (!titel || !locatie || !beschrijving) {
    if (msg) msg.textContent = "Vul alle velden in.";
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
  data.unshift(opdracht); // nieuw bovenaan
  setOpdrachten(data);

  if (msg) {
    msg.textContent = "✅ Opdracht geplaatst! Ondernemers kunnen hem nu zien.";
    msg.classList.add("show");
  }

  // reset form
  document.getElementById("titel").value = "";
  document.getElementById("locatie").value = "";
  document.getElementById("beschrijving").value = "";

  // optional: auto naar ondernemer
  // window.location.href = "ondernemer.html";
}

function toonOpdrachten(filterText = "") {
  const lijst = document.getElementById("lijst");
  const empty = document.getElementById("empty");
  if (!lijst) return;

  lijst.innerHTML = "";
  const q = filterText.trim().toLowerCase();

  const data = getOpdrachten().filter(o => {
    if (!q) return true;
    return (
      o.titel.toLowerCase().includes(q) ||
      o.locatie.toLowerCase().includes(q) ||
      o.beschrijving.toLowerCase().includes(q)
    );
  });

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
        <div>
          <div class="item-title">${escapeHtml(o.titel)}</div>
          <div class="item-meta">
            <span class="badge">${escapeHtml(o.locatie)}</span>
            <span class="muted small">• ${formatDate(o.createdAt)}</span>
          </div>
        </div>

        <div class="item-actions">
          <button class="btn btn-ghost btn-sm" data-id="${o.id}" data-action="interest">Interesse</button>
          <button class="btn btn-danger btn-sm" data-id="${o.id}" data-action="remove">Verwijder</button>
        </div>
      </div>

      <p class="item-desc">${escapeHtml(o.beschrijving)}</p>
    `;

    lijst.appendChild(li);
  });

  // Event delegation
  lijst.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");

    if (action === "interest") {
      alert("✅ Interesselijst (demo): In een volgende versie sturen we contactgegevens of een bericht.");
    }

    if (action === "remove") {
      const ok = confirm("Opdracht verwijderen?");
      if (!ok) return;
      const newData = getOpdrachten().filter(x => x.id !== id);
      setOpdrachten(newData);
      toonOpdrachten(document.getElementById("search")?.value || "");
    }
  }, { once: true });
}

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
}

/* Helpers */

function cryptoRandomId() {
  // werkt in moderne browsers
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
