//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432


// 1. TODO: commencer la fonction genererProchainMot()
// 2. TODO: commencer la fonction genererPhrase()
// 3. TODO: commencer la fonction genererParagraphes()
// 
// 4. TODO: une fois que ces fonctions sont codées, on verra si
//          le code qu'on a déjà fonctionne même avec ordre-r


/* C'est la fonction principale. Elle reçoit du texte : string 
 * et retourne un objet: {[strings], [enregistrements]}
 * 
 * L'objet retourné est un modèle de Markov qui suit les specs 
 * exigées dans l'énoncé.
 */
var creerModele = function(texte, r = 1) {

    var mots = obtenirMots(texte), // sépare sur les " " et les "\n"
        groupes = grouper(mots, r),
        megaGroupes = megaGrouper(mots, r),
        modele = {};

    modele.dictionnaire = toutSaufLesDerniers(groupes);

    modele.prochainsMots = trouverProchains(modele.dictionnaire, 
        megaGroupes);

    console.log("dictionnaire:"); console.table(modele.dictionnaire);
    console.log("prochainsMots:"); console.table(modele.prochainsMots);

    return modele;
};


/* Cette méthode cherche un mot dans un tableau d'enregistrements
 * Elle retourne l'index du mot ciblé. 
 */
Array.prototype.indexOfMot = function (motCible){
    for (var i = 0; i < this.length; i++)
        if (this[i].mot == motCible)
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
 *
 * Pour comprendre le fonctionnement de cette fonction, il est important
 * de savoir que l'argument megaGroupes contient des paires de 2 strings:
 * a) la 1re string contient les mots précédents
 * b) la 2e string contient le mot actuel.
 */
function trouverProchains(dico, megaGroupes) {
    var resultat = [],
        compte = 0,
        i = 0,
        bonIndex;

    // tu peux en apprendre plus sur for...of
    // ici: https://mzl.la/2qI1t5t
    for (mot of dico) {  
        resultat.push([]);
        for (paire of megaGroupes) {
            if (paire[0] == mot) {
                compte++; // servira à calculer la prob du mot
                bonIndex = resultat[i].indexOfMot(paire[1]); //cherche paire[1]
                if (bonIndex == -1)
                    resultat[i].push({mot:paire[1], prob:1});
                else
                    resultat[i][bonIndex].prob++;
            }
        }
        for (var j = 0; j < resultat[i].length; j++)
            resultat[i][j].prob /= compte; // calcule la prob du mot
        compte = 0;
        i++;
    }
    return resultat;
}


function toutSaufLesDerniers(tableau) {
    return [...new Set(tableau.map(function (e) {
        return e.slice(0, e.length - 1).join(" ");
    }))];
}


/* reçoit du texte : String
 * => retourne un tableau de tous les mots de ce texte : [Strings]
 */
function obtenirMots(texte, n) { //A quoi sers n???
    var mots = [],
        motActuel = "",
        actuel = "";
    for (var i = 0; i < texte.length; i++) {
        actuel = texte.charAt(i);
        if (estEspaceOuRetour(actuel)) {  			//Endroit ou on split notre texte en tab de mots
            if (!estEspaceOuRetour(precedent))
                mots.push(motActuel);
            motActuel = "";
        } else {
            motActuel += actuel;
            if (i == texte.length - 1)
                mots.push(motActuel);				//Clearly need help
        }
        precedent = actuel;							//What is precedent
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
 * et retourne un tableau de la forme [[string, string]]
 * 
 * Le tableau retourné représente les n mots consécutifs,
 * suivis du mot qui les suit.
 *
 * Les "mégaGroupes" obtenus ne sont pas nécessairement 
 * uniques, au contraire, ils sont exhaustifs. Ça permettra
 * de compter les occurences de leur mot final plus tard.
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
function debutPropre(tableau){						//A tuer?
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


// cette fonction retourne une Bool qui indique si les 2 tableaux
// passés en arguments ont les mêmes valeurs.
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


// cette fonction retourne les mots uniques du tableau qu'elle reçoit.
// input: [strings]
// output: [strings]
function motsUniques(tableau) {
    var resultat = tableau.filter(function(mot, i, tableau){
        return tableau.indexOf(mot) === i;
    });
    return resultat;
}


// TODO : compléter cette fonction				Continuer ici
var genererProchainMot = function(modele, motActuel) {
	//On va chercher l'indice de motActuel en parcourant le dictionnaire
	var motMaintenant=""
	var index = modele.dictionnaire.indexOf(motActuel);
	var prochainsMotsPossibles = modele.prochainsMots[index];
	var uniforme01= Math.random, cummul=0;
	for(motPossible of prochainsMotsPossibles){
		cummul+=motPossible.prob;
		if(cummul>uniforme01){
			motMaintenant=motPossible.mot;
			return motMaintenant;
		}
		
	}

	
	
	
	
};


// TODO : compléter cette fonction
var genererPhrase = function(modele, maxNbMots) {

};


// TODO : compléter cette fonction
var genererParagraphes = function(modele, nbParagraphes, maxNbPhrases, maxNbMots) {

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


// Utilitaires pour manipuler des fichiers
var fs = require("fs");

var readFile = function (path) {
    return fs.readFileSync(path).toString();
};

var writeFile = function (path, texte) {
    fs.writeFileSync(path, texte);
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
};
