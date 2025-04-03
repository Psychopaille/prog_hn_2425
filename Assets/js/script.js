document.addEventListener("DOMContentLoaded", function () {
    window.tokensGlobal = [];
  
    document.getElementById("ask-name").addEventListener("click", function () {
      let name = prompt("Comment vous appelez-vous ?");
      if (name) {
        alert("Enchanté, " + name + " !");
      } else {
        alert("Vous n'avez rien saisi.");
      }
    });
  
    document.getElementById("show-help").addEventListener("click", function () {
      alert("Cliquez sur 'Comment vous appelez-vous ?' pour entrer votre nom.\nCliquez sur 'Afficher l'aide' pour voir ce message.\nCliquez sur 'Segmenter le texte' pour visualiser les tokens du texte.\nCliquez sur 'Créer un dictionnaire de fréquence' pour obtenir les fréquences des mots segmentés et les exporter en CSV.\nUtilisez le GREP pour rechercher un motif, ou le concordancier pour voir le mot dans son contexte.");
    });
  });
  
  window.segmenterTexte = function () {
    const input = document.getElementById("text-input").value;
    const separateur = document.getElementById("separateur").value;
    const sortie = document.getElementById("separateur-sortie").value || " | ";
  
    let tokens;
    if (separateur === "") {
      tokens = input.trim().split(/\s+/);
    } else {
      const regexSeparateur = new RegExp(separateur, "g");
      tokens = input.split(regexSeparateur).map(t => t.trim()).filter(Boolean);
    }
  
    window.tokensGlobal = tokens;
    const resultat = tokens.join(sortie);
    document.getElementById("resultat-segmentation").textContent = resultat;
  };
  
  window.genererDictionnaire = function () {
    const frequences = {};
  
    window.tokensGlobal.forEach(mot => {
      mot = mot.toLowerCase();
      frequences[mot] = (frequences[mot] || 0) + 1;
    });
  
    let tableauHTML = "<table id='table-freq'><thead><tr><th>Mot</th><th>Fréquence</th></tr></thead><tbody>";
  
    Object.entries(frequences)
      .sort((a, b) => b[1] - a[1])
      .forEach(([mot, freq]) => {
        tableauHTML += `<tr><td>${mot}</td><td>${freq}</td></tr>`;
      });
  
    tableauHTML += "</tbody></table>";
    tableauHTML += "<br><button onclick='exporterCSV()'>Exporter en CSV</button>";
    document.getElementById("tableau-frequence").innerHTML = tableauHTML;
  };
  
  window.exporterCSV = function () {
    const lignes = ["Mot,Fréquence"];
    const lignesTable = document.querySelectorAll("#table-freq tbody tr");
  
    lignesTable.forEach(row => {
      const cells = row.querySelectorAll("td");
      const ligne = `${cells[0].textContent},${cells[1].textContent}`;
      lignes.push(ligne);
    });
  
    const blob = new Blob([lignes.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "frequence_mots.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  window.executerGrep = function () {
    const motif = document.getElementById("grep-input").value;
    const regex = new RegExp(motif, "i");
    const resultats = window.tokensGlobal.filter(mot => regex.test(mot));
    document.getElementById("grep-resultats").textContent = resultats.join(", ");
  };
  
  window.genererConcordancier = function () {
    const motRecherche = document.getElementById("concorde-input").value.trim().toLowerCase();
    const contextRange = 3;
    const zoneResultats = document.getElementById("concorde-resultats");
  
    if (!motRecherche) {
      zoneResultats.innerHTML = "<i>Veuillez entrer un mot à rechercher.</i>";
      return;
    }
  
    if (!window.tokensGlobal.length) {
      zoneResultats.innerHTML = "<i>Veuillez d'abord segmenter le texte.</i>";
      return;
    }
  
    let lignes = [];
  
    window.tokensGlobal.forEach((mot, index) => {
      if (mot.toLowerCase() === motRecherche) {
        const gauche = window.tokensGlobal.slice(Math.max(0, index - contextRange), index).join(" ");
        const droit = window.tokensGlobal.slice(index + 1, index + 1 + contextRange).join(" ");
        lignes.push(`... ${gauche} <b>${mot}</b> ${droit} ...`);
      }
    });
  
    if (lignes.length === 0) {
      zoneResultats.innerHTML = `<i>Aucune occurrence trouvée pour : ${motRecherche}</i>`;
    } else {
      zoneResultats.innerHTML = lignes.join("<br>");
    }
  };
  