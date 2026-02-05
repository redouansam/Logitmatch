function opslaan() {
    const opdracht = {
      titel: document.getElementById("titel").value,
      locatie: document.getElementById("locatie").value,
      beschrijving: document.getElementById("beschrijving").value
    };
  
    const data = JSON.parse(localStorage.getItem("opdrachten") || "[]");
    data.push(opdracht);
    localStorage.setItem("opdrachten", JSON.stringify(data));
  
    alert("Opdracht geplaatst!");
  }
  
  function toonOpdrachten() {
    const lijst = document.getElementById("lijst");
    const data = JSON.parse(localStorage.getItem("opdrachten") || "[]");
  
    data.forEach(o => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${o.titel}</strong> – ${o.locatie}<br>${o.beschrijving}<br><button>Interesse</button>`;
      lijst.appendChild(li);
    });
  }
  