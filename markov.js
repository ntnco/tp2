//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432


// Roadmap
// 1. commencer la fonction genererProchainMot()
// 2. commencer la fonction genererPhrase()
// 3. commencer la fonction genererParagraphes()
// 4. TODO: s'assurer que 1 à 3 fonctionnent bien avec les données wiki
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
 * Elle retourne l'index de l'enregistrement contenant le mot ciblé. 
 */
Array.prototype.indexOfMot = function (motCible){
    for (var i = 0; i < this.length; i++)
        if (this[i].mot == motCible)
            return i;
    omremegaGrouper(mots, n) {
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
function debutPropre(tableau){ //se fait appeler par megaGroupes
    var i;
    for (i = 0; i < tableau.length; i++)
        if (tableau[i] != "") 
            break;
    return i;
}


// reçoit un caractère: String
// => retourne si c'est un espace: Bool
function estEspaceOuRetour(caract) {
    return (caract == " " || caract == "\n"); 
}


// Cette fonction obtient l'indice de motActuel en parcourant le dictionnaire
var genererProchainMot = function(modele, motActuel) {
    var index = modele.dictionnaire.indexOf(motActuel),
        prochainsPossibles = modele.prochainsMots[index],
        uniforme01 = Math.random(), 
        cumul = 0;

    for (cas of prochainsPossibles) {
        cumul += cas.prob;
        if (cumul > uniforme01)
            return cas.mot;
    }
};


// exemple d'appel de genererProchainMot:
// genererProchainMot(modeleTaco, "taco")
var modeleTaco = creerModele("Je suis le plus taco des taco, j'aime tous le taco du monde et je taco taco avec toi taco");


var genererPhrase = function(modele, maxNbMots) {
    var prochainMot,
        phrase = [];
        motActuel = "";

    for (var i = 0; i < maxNbMots; i++) {
        prochainMot = genererProchainMot(modele, motActuel);
        if (prochainMot == "")
            break;
        if (i == maxNbMots - 1)
            prochainMot += ".";
        phrase.push(prochainMot);
        motActuel = prochainMot;
    }
    return phrase.join(" ");
};


/* Cette fonction reçoit un modèle (objet) et 3 nombres.
 * Elle retourne une String
var genererParagraphes = function(modele, nbParagraphes, maxNbPhrases, maxNbMots) {
    var paragraphes = [],
        paragraphe = [],
        phrase = "";

    for (var i = 0; i < nbParagraphes; i++) {
        for (var j = 0; j < maxNbPhrases; j++) {
            phrase = genererPhrase(modele, maxNbMots);
            paragraphe.push(phrase);
        }
        paragraphes.push(paragraphe.join(" "));
        paragraphe = [];
    }

    return paragraphes.join("\n");
};


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
     * fichier avec : 
     * node markov.js
     */
    
    // tests pour creerModele()
    console.assert(JSON.stringify(creerModele("no more tacos")) ==
        '{"dictionnaire":["","no","more","tacos"],'+
        '"prochainsMots":[[{"mot":"no","prob":1}],[{"mot":"more","prob":1}],'+
        '[{"mot":"tacos","prob":1}],[{"mot":"","prob":1}]]}');

    // tests pour la méthode Array.prototype.indexOfMot()
    console.assert([{mot: "hey", prob: 2}, {mot: "taco", prob: 3}]
        .indexOfMot("hey") == 0);
    console.assert([{mot: "hey", prob: 2}, {mot: "taco", prob: 3}]
        .indexOfMot("taco") == 1);

    // tests pour trouverProchains(dico, megaGroupes)
    console.assert(JSON.stringify(trouverProchains(["", "hey", "yaa"], 
        [["", "lalala"], ["hey", "yaa"], ["hey", "naa"], ["yaa", ""]])) == 
        '[[{"mot":"lalala","prob":1}],[{"mot":"yaa","prob":0.5},' +
        '{"mot":"naa","prob":0.5}],[{"mot":"","prob":1}]]');

    // tests pour toutSaufLesDerniers()
    console.assert("" + toutSaufLesDerniers([["", "b"], ["sponge", "bob"]]) == 
        ",sponge");

    // tests pour obtenirMots()
    console.assert("" + obtenirMots("ah que la neige a neigé") == 
        "ah,que,la,neige,a,neigé");

    // tests pour grouper(mots, n)
    console.assert("" + grouper(["ah", "que", "bonjour"], 1) == 
        ",ah,ah,que,que,bonjour,bonjour,");
    console.assert("" + grouper(["ah", "que", "bonjour"], 2) == 
        ",,ah,,ah,que,ah,que,bonjour,que,bonjour,");

    // tests pour megaGrouper(mots, n)
    console.assert("" + megaGrouper(["ah", "que", "bonjour"], 1) == 
        ",ah,ah,que,que,bonjour,bonjour,", 
        new Error().stack); // output pareil à celui de grouper()
    console.assert("" + megaGrouper(["ah", "que", "bonjour"], 2) ==
        ',ah,ah,que,ah que,bonjour,que bonjour,', 
        new Error().stack); // output *différent* de celui de grouper()

    // tests pour debutPropre(tableau)
    console.assert(debutPropre(["", "", "", "helloooooow"]) == 3);

    // à noter que les fonctions qui génèrent des mots/phrases/paragraphes
    // ne sont pas à tester, car elles contiennent des données aléatoires.

    // tests pour estEspaceOuRetour()
    console.assert(estEspaceOuRetour(" ") == true);
    console.assert(estEspaceOuRetour("\n") == true);
    console.assert(estEspaceOuRetour("a") == false);
    console.assert(estEspaceOuRetour("0") == false);
};


if (require.main === module) {
    // Si on se trouve ici, alors le fichier est exécuté via : nodejs markov.js
    tests(); // On lance les tests
} else {
    /* Sinon, le fichier est inclus depuis index.js
       On exporte les fonctions importantes pour le serveur web */
    exports.creerModele = creerModele;
    exports.genererParagraphes = genererParagraphes;
}



