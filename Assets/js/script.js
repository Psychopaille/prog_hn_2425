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
    const segmentButton = document.querySelector("button[onclick='segmenterTexte()']");
    if (segmentButton) {
        segmentButton.addEventListener("click", function() {
            const input = document.getElementById("text-input").value;
            const tokens = input.trim().split(/\s+/);
            const resultat = tokens.join(", ");
            document.getElementById("resultat-segmentation").textContent = resultat;
        });
    }
});