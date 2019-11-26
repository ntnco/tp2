//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432


// Roadmap
// 1. commencer la fonction genererProchainMot()
// 2. commencer la fonction genererPhrase()
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
 * Elle retourne l'index de l'enregistrement contenant le mot ciblé. 
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


/* reçoit du texte : string
 * => retourne un tableau de tous les mots de ce texte : [strings]
 *
 * fonctionnement: traverse chaque caractère et les ajoute à la 
 * variable motActuel. Lorsqu'elle frappe une espace ou un retour à la ligne,
 * elle pousse motActuel dans le tableau des mots à retourner, puis 
 * réassigne motActuel à une string vide "".
 */
function obtenirMots(texte) { 
    var mots = [],
        motActuel = "",
        caracActuel, caracPrecedent;
    for (var i = 0; i < texte.length; i++) {
        caracActuel = texte.charAt(i);
        if (estEspaceOuRetour(caracActuel)) {  // si " " ou "\n" 
            if (caracActuel == "\n")
                mots.push(""); // signale un début et une fin de phrase
            if (!estEspaceOuRetour(caracPrecedent)) 
                mots.push(motActuel); // car fin du mot
            motActuel = "";
        } else {
            motActuel += caracActuel;
            if (i == texte.length - 1)
                mots.push(motActuel); // car fin du texte
        }
        caracPrecedent = caracActuel;
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
function debutPropre(tableau){ //se fait appeler par megaGroupes
    var i;
    for (i = 0; i < tableau.length; i++)
        if (tableau[i] != "") 
            break;
    return i;
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
    if (tableau1.length != tableau2.length)
        return false; // permet de gérer les tableaux vides.
    for (var i = 0; i < tableau1.length; i++) {
        if (tableau1[i] !== tableau2[i]) // doivent être de même type
            return false;
    }
    return true;
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
        nombreHasard = Math.random(), 
        cumul = 0;

    for (option of prochainsPossibles) {
        cumul += option.prob;
        if (cumul > nombreHasard)
            return option.mot;
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


// TODO : compléter cette fonction
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
        paragraphe = []
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
    fichier avec :
       node markov.js
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

    // tests pour la méthode Array.prototype.indexOfArrays
    console.assert([["u", ""], ["a", 0], ["hum"]].indexOfArrays(["hum"]) == 2,
    new Error().stack);
    console.assert([["u", ""], ["a", 0], ["hum"]].indexOfArrays(["u", ""]) == 0,
    new Error().stack);
    console.assert([["u", ""], ["a", 0], ["hum"]].indexOfArrays(["a", 0]) == 1,
    new Error().stack);
    console.assert([[], [0], ["zéro"]].indexOfArrays([]) == 0);
    console.assert([[0], [], []].indexOfArrays([]) == 1);

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

    // tests pour sontIdentiques(tableau1, tableau2)
    console.assert(sontIdentiques([], []));
    console.assert(sontIdentiques(["Barack Obama"], ["Barack Obama"]));

    // tests pour genererProchainMot
    console.assert(true);

    // tests pour genererPhrase
    console.assert(true);

    // tests pour genererParagraphes
    console.assert(true);

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



