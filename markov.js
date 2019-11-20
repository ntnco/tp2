1// Auteurs:
// Emma Parent-Senez, 20071506
// Antoien Colson-Ratelle, 990432

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
function obtenirMots(texte) { // p-ê faire map ou autre coool chose
                              // TODO: faire fonction similaire qui sépare
                              //       les paires de mots ?
    var mots = [];
    var paires = [];
    var motActuel = "";
    var motPrecedent = "";
    var precedent = " ";
    var actuel = "";

    var occurences = {}; // {mot1:#, mot2:#, mot3:#... motn:#}
    
    //var occurences = []
    
    for (var i = 0; i < texte.length; i++) {
        actuel = texte.charAt(i);
        if (estEspaceOuRetour(actuel)) {
            if (!estEspaceOuRetour(precedent)){
                mots.push(motActuel);
                paires.push([motPrecedent, motActuel])
            }
            motPrecedent = motActuel;
            motActuel = "";
        } else {
            motActuel += actuel;
            if (i == texte.length - 1){
                mots.push(motActuel);
                paires.push([motPrecedent, motActuel])
            }
        }
        precedent = actuel;
    }
    return [mots, paires];
}



// reçoit un caractère: String
// => retourne si c'est un espace: Bool
function estEspaceOuRetour(caract) {
    return (caract == " " || caract == "\n"); 
}



/* cette fonction reçoit du texte et 
 * 1. en sépare les mots
 * 2. obtient les mots uniques
 * 3. appelle markov() pour obtenir un modèle de markov
 * 4. retourne le modèle
 */
var creerModele = function(texte) {

    var mots = obtenirMots(texte); // faut séparer sur les " " et les "\n"
    var dictionnaire = uniques(mots);
        
    var modele = markov(dictionnaire, mots);

    return modele;
    
};

function uniques(tableau) {

    // cette première opération sert aux bonus sur les ordres, donc
    // au cas où les éléments du tableau sont eux-mêmes des tableaux.
    var tabStrings = tableau.map(function(x) { 
        return "" + x;
    });

    var resultat = tabStrings.filter(function(mot, i, tabStrings){
        return tabStrings.indexOf(mot) === i;});

    return resultat;
}

// pour la markov d'ordre 1, on a besoin:
// 1. array de tous les mots (on l'a : mots)
// 2. array des mots uniques (on l'a : dictionnaire)
// 3. TODO: objet avec les nombres d'occurences de tous les mots
// 4. array avec toutes les paires
// 5. TODO: array avec toutes les paires uniques
// 6. TODO: objet avec les nombres d'occurences de toutes les paires
// 7. TODO: mettre tout ça ensemble et calculer les probas, ce qui 
//          va nous donner le modèle à retourner.


function markov(dictionnaire, mots) {

    dictionnaire = "".concat(dictionnaire, "");
    
























    /*var prochainsMots = dictionnaire.map(function(element, index) {

        var occurencesElement = 0; 
        var suivants = {};
        var motPrecedent = "";

        for (var i = 0; i < mots.length; i++) {
            // quand on trouve le mot, on check le suivant 
            // puis on incrémente l'objet _suivants_ à cette clé.
        }
	// une fois la boucle terminée, on calcule la proba de chaque mot
	// et on pousse un enregistrement de chaque prochain mot dans 
	// prochainsMots comme demandé dans l'énoncé.
	//
	// Cette boucle sera répétée pour chaque élément du dictionnaire.
	//
	// self-rappel: le prochain peut possiblement être le même mot.
    })*/


    return {dictionnaire: dictionnaire, 
        prochainsMots: prochainsMots};
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
	console.log(obtenirMots(["Je suis une toute toute toute totoche"]));
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
