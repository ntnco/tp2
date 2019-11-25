//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432



/* cette fonction reçoit du texte et 
 * 1. en sépare les mots
 * 2. obtient les mots uniques
 * 3. appelle markov() pour obtenir un modèle de markov
 * 4. retourne le modèle
 */
var creerModele = function(texte, r = 2) {
    var mots = obtenirMots(texte), // sépare sur les " " et les "\n"
        dicoUniques = motsUniques(mots), // grouperUniques de taille r-1 
        groupes = grouper(mots, r),
        groupesUniques = reEspacer(grouperUniques(groupes)),
        cardinaliteMots = occurencesMots(mots),
        cardinaliteGroupes = occurencesGroupes(groupes); 

    var modele = {};

    modele.dictionnaire = groupesUniques
        .slice(0, groupesUniques.length - 1)
        .join(" ");

    modele.prochainsMots = prochains(dicoUniques, groupesUniques, 
        cardinaliteMots, cardinaliteGroupes)

    return modele;
};

function reEspacer(groupes) {
    console.table(groupes);
    var tableauUniques = groupes.map(function (x) {
        if (x[0] == "")
            return x[x.length - 1]; // trouver qqch qui corrige ça :)
        return x.join(" ");
    });
    return tableauUniques;
}



function prochains(dicoUniques, groupesUniques, 
    cardinaliteMots, cardinaliteGroupes) {

    var resultat = [], 
        mot;

    // cette boucle check 
    // 1. si le mot est le dernier du groupe unique de même index
    // 2. si oui, alors resultat.push(le reste )
    for (var i = 0; i < dicoUniques.length; i++) {
        mot = dicoUniques[i];
        groupeActuel = groupesUniques[i];
        if (groupeActuel[groupeActuel.length - 1] == mot) {
            resultat.push(mot);
        }
    }

    return resultat; // retourne rien, à enquêter... 
}


// Utilitaires pour manipuler des fichiers
var fs = require("fs");

var readFile = function (path) {
    return fs.readFileSync(path).toString();
};

var writeFile = function (path, texte) {
    fs.writeFileSync(path, texte);
};



/* reçoit du texte : String
 * => retourne un tableau de tous les mots de ce texte : [Strings]
 */
function obtenirMots(texte, n) { 
    var mots = [],
        motActuel = "",
        actuel = "";
    for (var i = 0; i < texte.length; i++) {
        actuel = texte.charAt(i);
        if (estEspaceOuRetour(actuel)) {
            if (!estEspaceOuRetour(precedent))
                mots.push(motActuel);
            motActuel = "";
        } else {
            motActuel += actuel;
            if (i == texte.length - 1)
                mots.push(motActuel);
        }
        precedent = actuel;
    }
    return mots;
}


/* commentaires explicatifs ici
 *
 */
function grouper(mots, r) {
    var vides = Array(r - 1).fill(""),
        tableauComplet = vides.concat(mots),
        resultat = [];

    for (var i = 0; i < mots.length; i++)
        resultat.push(tableauComplet.slice(i, i + r))
    return resultat;
}


function grouperUniques(groupes) {
    if (groupes[0].length == 1) 
        return [...new Set(groupes)]; 
    var resultat = groupes.filter(function(x, index, groupes) {
        return groupes.indexOfArrays(x) == index
    })
    return resultat
}


// cette fonction donne l'index d'un sous-tableau dans un tableau 2D
// elle ne devrait jamais retourner -1 dans les cadre de cet exercice.
Array.prototype.indexOfArrays = function (sousTableau) {
    for (var i = 0; i < this.length; i++) {
        if (sontIdentiques(sousTableau, this[i]))
            return i;
    }     
    return -1;
}


function sontIdentiques(tableau1, tableau2) {
    for (var i = 0; i < tableau1.length; i++) {
        if (tableau1[i] != tableau2[i])
            return false;
    }
    return true;
}


// reçoit un caractère: String
// => retourne si c'est un espace: Bool
function estEspaceOuRetour(caract) {
    return (caract == " " || caract == "\n"); 
}





function motsUniques(tableau) {

    var resultat = tableau.filter(function(mot, i, tableau){
        return tableau.indexOf(mot) === i;
    });
    return resultat;
}


function occurencesMots(mots) {
    var resultat = {};
    for (var i = 0; i < mots.length; i++) {
        if (!(mots[i] in resultat))
            resultat[mots[i]] = 1;
        else 
            resultat[mots[i]]++;
    }
    return resultat;
}


function occurencesGroupes(groupes) {
    var resultat = {};
    var groupeFormatte; 
    for (var i = 0; i < groupes.length; i++) {
        groupeFormatte = groupes[i].join(" ");
        if (!(groupeFormatte in resultat))
            resultat[groupeFormatte] = 1;
        else 
            resultat[groupeFormatte]++;
    }
    return resultat;
}



// pour la markov d'ordre 1, on a besoin:
// 1. array de tous les mots (on l'a : mots)
// 2. array des mots uniques (on l'a : dictionnaire)
// 3. objet avec les nombres d'occurences de tous les mots
// 4. array avec toutes les paires et groupes-r yeahhhhh
// 5. array avec toutes les paires uniques
// 6. objet avec les nombres d'occurences de toutes les paires
// 7. TODO: en se basant sur l'occurence d'une paire donnée, 
//          diviser par le total d'occurences du dernier mot ce qui donne sa proba
// 8. TODO: généraliser à r 


// TODO : compléter cette fonction
var genererProchainMot = function(modele, motActuel) {

};


// TODO : compléter cette fonction
var genererPhrase = function(modele, maxNbMots) {
    
};


// TODO : compléter cette fonction
var genererParagraphes = function(modele, nbParagraphes, maxNbPhrases, maxNbMots) {
    
};




var tests = function() {
    /* Les tests seront lancés automatiquement si vous appelez ce
    fichier avec :
       node markov.js
     */
	
    console.assert(estEspaceOuRetour(" ") == true);
    console.assert(estEspaceOuRetour("\n") == true);
    console.assert(estEspaceOuRetour("a") == false);
    console.assert(estEspaceOuRetour("0") == false);
	console.log(obtenirMots("Je suis une toute toute toute totoche"));
    console.log('Les tests ont été exécutés.'); // cette ligne peut être effacéééééééée

};



if (require.main === module) {
    // Si on se trouve ici, alors le fichier est exécuté via : nodejs gen.js
    tests(); // On lance les tests
} else {
    /* Sinon, le fichier est inclus depuis index.js
       On exporte les fonctions importantes pour le serveur web */
    exports.creerModele = creerModele;
    exports.genererParagraphes = genererParagraphes;
}
