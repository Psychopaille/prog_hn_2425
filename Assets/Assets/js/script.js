document.addEventListener("DOMContentLoaded", function() {
    // Fonction pour demander le nom
    document.getElementById("ask-name").addEventListener("click", function() {
        let name = prompt("Comment vous appelez-vous ?");
        if (name) {
            alert("Enchanté, " + name + " !");
        } else {
            alert("Vous n'avez rien saisi.");
        }
    });

    // Fonction pour afficher l'aide
    document.getElementById("show-help").addEventListener("click", function() {
        alert("Cliquez sur 'Comment vous appelez-vous ?' pour entrer votre nom.\nCliquez sur 'Afficher l'aide' pour voir ce message.");
    });

    // Fonction de segmentation de texte
    window.segmenterTexte = function() {
        const input = document.getElementById("text-input").value;
        const separateur = document.getElementById("separateur").value;
        const sortie = document.getElementById("separateur-sortie").value || " | ";

        let tokens;
        if (separateur === "") {
            tokens = input.trim().split(/\s+/); // par défaut : espace(s)
        } else {
            const regexSeparateur = new RegExp(separateur, "g");
            tokens = input.split(regexSeparateur).map(t => t.trim()).filter(Boolean);
        }

        const resultat = tokens.join(sortie);
        document.getElementById("resultat-segmentation").textContent = resultat;
    };

    // Fonction de création du dictionnaire de fréquence
    window.genererDictionnaire = function() {
        const input = document.getElementById("text-input").value.toLowerCase();
        const mots = input.match(/\b[\wàâäéèêëîïôöùûüç'-]+\b/g);

        const frequences = {};

        if (mots) {
            mots.forEach(mot => {
                frequences[mot] = (frequences[mot] || 0) + 1;
            });
        }

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

    // Fonction d'export CSV
    window.exporterCSV = function() {
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
});
