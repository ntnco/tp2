//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432


// 1. TODO: en se basant sur l'occurrence d'une paire donnée, 
//          diviser par le total d'occurences du dernier mot
//          ce qui donne sa prob: n


/* C'est la fonction principale. Elle reçoit du texte : string 
 * et retourne un objet: {[strings], [enregistrements]}
 * 
 * Le format de l'objet retourné est spécifié dans l'énoncé. 
 * C'est un modèle de Markov.
 */
var creerModele = function(texte, r = 1) {
    
    var mots = obtenirMots(texte), // sépare sur les " " et les "\n"
        groupes = grouper(mots, r),
        megaGroupes = megaGrouper(mots, r),
        modele = {};
        
    modele.dictionnaire = toutSaufLesDerniers(groupes);

    modele.prochainsMots = trouverProchains(modele.dictionnaire, 
        megaGroupes); // on rajoutera les cardinalités après

    console.log("dictionnaire:")
    console.table(modele.dictionnaire);
    console.log("prochainsMots:")
    console.table(modele.prochainsMots);

    return modele;
};


Array.prototype.indexOfKey = function (clef){
    for (var i = 0; i < this.length; i++)
        if (this[i].mot == clef)
            return i;
    return -1;
}


/* Cette fonction reçoit 2 tableaux:
 * 1. Le premier tableau contient des strings
 * 2. Le deuxième tableau contient des paires de strings
 *    Le 1er élément de la paire est les r éléments qui précèdent un mot
 *    Le 2e élément de la paire est ce mot.
 *
 * Elle retourne un tableau d'enregistrements en comptant les occurences 
 * du 2e élément du 2e tableau.
 */
function trouverProchains(dico, megaGroupes) {
    var resultat = [],
        compte = 0,
        i = 0,
        bonIndex;
    for (mot of dico) {
        resultat.push([]);
        for (paire of megaGroupes) {
            if (paire[0] == mot) {
                compte++
                bonIndex = resultat[i].indexOfKey(paire[1]);
                if (bonIndex == -1) {
                    resultat[i].push({mot:paire[1], prob:1});
                } else {
                    resultat[i][bonIndex].prob++;
                }
            }
        }
        for (var j = 0; j < resultat[i].length; j++) {
            resultat[i][j].prob /= compte;
        }
        compte = 0;
        i++;
    }
    return resultat;
}

/* INUTILISÉE. à deleter.
 */
function grouperSimple(tableau) {
    return tableau.map(function (x) {
        var i = debutPropre(x);
        return x.slice(i).join(" "); // on laisse les espaces au début, 
        // car les espaces au début signifient qu'il y avait un "" avant :)
    })
}


function toutSaufLesDerniers(tableau) {
    return [...new Set(tableau.map(function (e) {
        return e.slice(0, e.length - 1).join(" ");
    }))];
}


function reEspacer(groupes) {
    var tableauUniques = groupes.map(function (x) {
        var i = debutPropre(x);
        return x.slice(i).join(" ");
    });
    return tableauUniques;
}



function prochains(dicoUniques, gUniques, 
    cardinaliteMots, cardinaliteGroupes) {

    var resultat = [], 
        mot;

    // cette boucle check 
    // 1. si le mot est le dernier du groupe unique de même index
    // 2. si oui, alors resultat.push(le reste )
    for (var i = 0; i < dicoUniques.length; i++) {
        mot = dicoUniques[i];
        groupeActuel = gUniques[i];
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


/* cette fonction reçoit un tableau de mots [strings]
 * et retourne tous les tableaux de n mots consécutifs
 */
function grouper(mots, n) {
    var vides = Array(n).fill(""),
        tableauComplet = vides.concat(mots, vides),
        resultat = [];

    for (var i = 0; i <= mots.length; i++)
        resultat.push(tableauComplet.slice(i, i + n + 1))
    return resultat;
}


/* cette fonction reçoit un tableau de mots [strings]
 * et retourne un tableau de la forme [string, string]
 * 
 * Le tableau retourné représente les n mots consécutifs,
 * suivis du mot qui les suit.
 *
 * Les "mégaGroupes" obtenus ne sont pas nécessairement 
 * uniques, au contraire, ils sont exhaustifs.
 * */
function megaGrouper(mots, n) {
    var megaGroupes = grouper(mots, n),
        resultat = megaGroupes.map(function (x) {
            var i = debutPropre(x);
            return [x.slice(i, x.length-1).join(" "), 
                x.slice(-1)[0]];
        });
    return resultat;
}


/* Cette fonction reçoit un tableau [strings]
 * et retourne le premier index où ce tableau ne commence pas
 * par une chaine vide. Type du retour: number
 */
function debutPropre(tableau){
    var i;
    for (i = 0; i < tableau.length; i++) {
        if (tableau[i] != "") 
            break;
    }
    return i;
}


/* Cette fonction prend un tableau 2D : [[strings]]
 * et retourne les tableaux uniques qu'il contient : [[strings]]
 */
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
