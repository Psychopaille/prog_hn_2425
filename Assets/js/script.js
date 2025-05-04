// script.js : logique principale du site avec affichage des résultats d'analyse textuelle

// Attendre que le DOM soit entièrement chargé avant d'exécuter tout code manipulant des éléments HTML
// Cela garantit que document.getElementById(...) trouvera bien les éléments
// --------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
  // Création d'un tableau global pour stocker les tokens extraits du texte
  // Utilisé ensuite par toutes les autres fonctions pour accéder aux mots segmentés
  window.tokensGlobal = [];

  // Listener pour le bouton "Comment vous appelez-vous ?"
  // prompt() affiche une boîte de dialogue pour saisir du texte
  // alert() affiche le résultat ou un message d'erreur si rien n'est saisi
  document.getElementById("ask-name").addEventListener("click", function () {
    let name = prompt("Comment vous appelez-vous ?");
    if (name) {
      alert("Enchanté, " + name + " !");
    } else {
      alert("Vous n'avez rien saisi.");
    }
  });

  // Listener pour le bouton "Afficher l'aide"
  // affiche un résumé des interactions possibles sur la page
  document.getElementById("show-help").addEventListener("click", function () {
    alert(
      "Cliquez sur 'Comment vous appelez-vous ?' pour entrer votre nom.\n" +
      "Cliquez sur 'Afficher l'aide' pour voir ce message.\n" +
      "Cliquez sur 'Segmenter le texte' pour visualiser les tokens.\n" +
      "Cliquez sur 'Créer un dictionnaire de fréquence' pour obtenir les fréquences, exporter en CSV et voir les graphiques et analyses.\n" +
      "Utilisez le GREP pour rechercher un motif, ou le concordancier pour voir un mot dans son contexte."
    );
  });
});

// Fonction de segmentation: découpe le texte saisi en tokens en fonction d'un séparateur
// --------------------------------------------------------------
window.segmenterTexte = function () {
  const input = document.getElementById("text-input").value;
  const separateur = document.getElementById("separateur").value;
  // Si l'utilisateur n'a rien fourni, on utilise un pipe avec espaces autour par défaut
  const sortie = document.getElementById("separateur-sortie").value || " | ";

  let tokens;
  if (!separateur) {
    // split sur tout type d'espace (espace, tabulation, retour à la ligne)
    tokens = input.trim().split(/\s+/);
  } else {
    // création dynamique d'un objet RegExp à partir de la chaîne saisie
    // le "g" permet de remplacer toutes les occurrences
    const regex = new RegExp(separateur, "g");
    // découpe, supprime les tokens vides et nettoie chaque token
    tokens = input.split(regex).map(t => t.trim()).filter(Boolean);
  }

  // On stocke le résultat dans la variable globale pour réutilisation
  window.tokensGlobal = tokens;
  // Affiche le résultat de la segmentation dans l'élément prévu
  document.getElementById("resultat-segmentation").textContent = tokens.join(sortie);
};

// Fonction principale pour générer le dictionnaire de fréquences, graphiques et analyses textuelles
// --------------------------------------------------------------
window.genererDictionnaire = function () {
  // Calcul des fréquences par mot (en minuscules pour regrouper les variantes)
  const frequences = {};
  window.tokensGlobal.forEach(mot => {
    const m = mot.toLowerCase();
    frequences[m] = (frequences[m] || 0) + 1;
  });

  // Construction d'un tableau HTML trié par fréquence décroissante
  let html = "<table id='table-freq'><thead><tr><th>Mot</th><th>Fréquence</th></tr></thead><tbody>";
  Object.entries(frequences)
    .sort((a, b) => b[1] - a[1])
    .forEach(([mot, freq]) => {
      html += `<tr><td>${mot}</td><td>${freq}</td></tr>`;
    });
  html += "</tbody></table><br><button onclick='exporterCSV()'>Exporter en CSV</button>";
  document.getElementById("tableau-frequence").innerHTML = html;

  // Préparation des données pour le diagramme en camembert (pie chart)
  const labels = Object.keys(frequences);
  const data = labels.map(l => frequences[l]);
  // Si un graphique existe déjà, le détruire avant d'en créer un nouveau
  if (window.pieChartInstance) window.pieChartInstance.destroy();
  const ctx = document.getElementById("pieChart").getContext("2d");
  window.pieChartInstance = new Chart(ctx, {
    type: 'pie',
    data: { labels, datasets: [{ data }] },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Répartition des mots' }
      }
    }
  });

  // Préparation du graphique de Zipf (log-log) avec échelle logarithmique
  const zipfCanvas = document.getElementById("zipfChart");
  if (window.zipfChartInstance) window.zipfChartInstance.destroy();
  const ctx2 = zipfCanvas.getContext("2d");
  const freqArray = Object.entries(frequences).sort((a, b) => b[1] - a[1]);
  const ranks = freqArray.map((_, i) => i + 1);
  const zipfData = freqArray.map(([_, f]) => f);
  window.zipfChartInstance = new Chart(ctx2, {
    type: 'line',
    data: { labels: ranks, datasets: [{ label: 'Fréquence', data: zipfData, fill: false, borderWidth: 1 }] },
    options: {
      responsive: true,
      scales: {
        x: { type: 'logarithmic', title: { display: true, text: 'Rang' } },
        y: { type: 'logarithmic', title: { display: true, text: 'Fréquence' } }
      },
      plugins: {
        title: { display: true, text: 'Loi de Zipf (log-log)' },
        legend: { display: false }
      }
    }
  });

  // Analyse textuelle pour identifier les mots/phrases les plus courts et les plus longs
  const rawText = document.getElementById("text-input").value.trim();
  const unique = Array.from(new Set(window.tokensGlobal.map(w => w.toLowerCase())));
  const lengths = unique.map(w => w.length);
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);
  const shortWords = unique.filter(w => w.length === minLen);
  const longWords = unique.filter(w => w.length === maxLen);

  // Séparation des phrases selon les ponctuations suivies d'un espace
  const sentences = rawText.split(/(?<=[\.\!?])\s+/).filter(s => s);
  const counts = sentences.map(s => s.split(/\s+/).length);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const shortSents = sentences.filter((_, i) => counts[i] === minCount);
  const longSents = sentences.filter((_, i) => counts[i] === maxCount);

  // Construction d'un tableau synthétique pour afficher ces statistiques
  let statsHTML = "<table id='text-stats-table'><thead><tr><th>Critère</th><th>Valeur</th></tr></thead><tbody>";
  statsHTML += `<tr><td>Mot le plus court</td><td>${shortWords.join(", ")}</td></tr>`;
  statsHTML += `<tr><td>Mot le plus long</td><td>${longWords.join(", ")}</td></tr>`;
  statsHTML += `<tr><td>Phrase la plus courte</td><td>${shortSents.join(" | ")}</td></tr>`;
  statsHTML += `<tr><td>Phrase la plus longue</td><td>${longSents.join(" | ")}</td></tr>`;
  statsHTML += "</tbody></table>";
  document.getElementById("text-stats").innerHTML = statsHTML;
};

// Fonction d'export CSV: génère un fichier CSV à partir du tableau de fréquences
// --------------------------------------------------------------
window.exporterCSV = function () {
  const rows = ["Mot,Fréquence"];
  // Parcourt chaque ligne du tableau #table-freq pour construire les lignes CSV
  document.querySelectorAll("#table-freq tbody tr").forEach(r => {
    const [w, f] = r.querySelectorAll("td");
    rows.push(`${w.textContent},${f.textContent}`);
  });
  // Création d'un blob et déclenchement du téléchargement
  const blob = new Blob([rows.join("\n")], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "frequence_mots.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Fonction GREP: recherche une expression régulière simple dans les tokens
// --------------------------------------------------------------
window.executerGrep = function () {
  const motif = document.getElementById("grep-input").value;
  const regex = new RegExp(motif, "i");  // "i" pour insensible à la casse
  const res = window.tokensGlobal.filter(w => regex.test(w));
  document.getElementById("grep-resultats").textContent = res.join(", ");
};

// Fonction concordancier: affiche chaque occurrence d'un mot avec son contexte
// --------------------------------------------------------------
window.genererConcordancier = function () {
  const m = document.getElementById("concorde-input").value.trim().toLowerCase();
  const zone = document.getElementById("concorde-resultats");
  if (!m) {
    zone.innerHTML = "<i>Veuillez entrer un mot à rechercher.</i>";
    return;
  }
  if (!window.tokensGlobal.length) {
    zone.innerHTML = "<i>Veuillez d'abord segmenter le texte.</i>";
    return;
  }
  const ctx = window.tokensGlobal;
  const range = 3;  // nombre de mots avant et après l'occurrence
  const lines = [];
  ctx.forEach((w, i) => {
    if (w.toLowerCase() === m) {
      // capture du contexte autour du mot, sans sortir des bornes du tableau
      const left = ctx.slice(Math.max(0, i-range), i).join(" ");
      const right = ctx.slice(i+1, i+1+range).join(" ");
      lines.push(`... ${left} <b>${w}</b> ${right} ...`);
    }
  });
  // Affiche les contextes ou un message si aucune occurrence
  zone.innerHTML = lines.length ? lines.join("<br>") : `<i>Aucune occurrence trouvée pour : ${m}</i>`;
};
