//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432
/*
Ce code a été conçu pour le vendredi 13 décembre 2019 et il sert a créer des
chaines(modèles) de Markov et de générer des paragraphes de texte structurés
respectant un nombre défini de mots par ligne et de lignes par paragraphes en 
respectant que les phrases commencent par des débuts de phrases de notre corpus
et doivent s'arrêter en présence d'un mot de fin de phrase.
*/

// Utilitaires pour manipuler des fichiers
var fs = require("fs");

var readFile = function (path) {
    return fs.readFileSync(path).toString();
};

var writeFile = function (path, texte) {
    fs.writeFileSync(path, texte);
};


/* C'est la fonction principale. Reçoit du texte : string 
 * Retourne un modèle de Markov: {[strings], [enregistrements]}
 */
var creerModele = function(texte, r = 1, trace) {

    var mots = obtenirMots(texte), 
        groupes = grouper(mots, r),
        megaGroupes = megaGrouper(mots, r),
        modele = {};

    modele.dictionnaire = toutSaufLesDerniers(groupes);
    modele.prochainsMots = trouverProchains(modele.dictionnaire, 
        megaGroupes);

    // pour déboguer la chaine d'ordre r, ne s'applique que 
    // si le 3e argument de creerModele() est true.
    if (trace) {
        console.log(groupes);
        console.log(megaGroupes);
        console.log("dictionnaire");
        console.table(modele.dictionnaire);
        console.log("prochainsMots");
        console.table(modele.prochainsMots);
    }

    return modele;
};

function t2() { // pour tester la chaine d'ordre 2
    creerModele(readFile("corpus/trivial"), 2, true) 
}


/* Cette méthode cherche un motCible de type string 
 * dans un tableau d'enregistrements.
 * Elle retourne l'index, de type number, de l'enregistrement
 * qui contient le motCible. 
 */
Array.prototype.indexOfMot = function (motCible){
    for (var i = 0; i < this.length; i++)
        if (this[i].mot == motCible)
            return i;
    return -1;
}


/* Cette fonction reçoit 2 tableaux en paramètres:
  1. Le premier tableau contient des strings
  2. Le deuxième tableau contient des paires de strings
     Le 1er élément de la paire est les r éléments qui précèdent un mot
     Le 2e élément de la paire est ce mot.
 
  Elle retourne un tableau d'enregistrements en comptant les occurences 
  (Probas?)du 2e élément du 2e tableau.
 
  Pour comprendre le fonctionnement de cette fonction, il est important
  de savoir que l'argument megaGroupes contient des paires de 2 strings:
  a) la 1re string contient les mots précédents
  b) la 2e string contient le mot actuel.
 */
function trouverProchains(dico, megaGroupes) {
    var resultat = [],
        compte = 0,
        i = 0,
        bonIndex;

    for (mot of dico) {  
        resultat.push([]);
        for (paire of megaGroupes) {
            if (paire[0] == mot && paire[1] != "") {
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

/*
Cette fonction prend un tableau de tableaux et retourne un tableau de même
longueur qui contient les mêmes tableaux de mots que celui passé en 
paramètres à l'exception qu'ils sont plus court de 1 puisque l'on enlève 
le dernier élément de chacun.
*/
function toutSaufLesDerniers(tableau) {
    return [...new Set(tableau.map(function (elem) {
        return elem.slice(0, elem.length - 1).join(" ");
    }))];
}


/* 
Cette fonction reçoit un texte et retrourne un tableau qui contient 
tous les mots du texte en les séparant aux espaces et aux sauts de ligne. Elle
appliquera le traitement approprié dans chacun des cas.
*/
function obtenirMots(texte) { 
    var mots = [],
        motActuel = "",
        caracActuel, caracPrecedent;
    for (var i = 0; i < texte.length; i++) {
        caracActuel = texte.charAt(i);
        if (estEspaceOuRetour(caracActuel)) {   

            //Confirmer la fin d'un mot et l'ajouter à la liste
            if (!estEspaceOuRetour(caracPrecedent)) 
                mots.push(motActuel); 
            motActuel = "";

            //Traitement spécial en fin de ligne	
            if (caracActuel == "\n")
                mots.push(""); 
        } else {
            motActuel += caracActuel;

            //Traitement de fin de texte
            if (i == texte.length - 1)
                mots.push(motActuel); 
        }
        caracPrecedent = caracActuel;
    }

    return mots;
}


/* 
Cette fonction reçoit un tableau de mots et un nombre n. 
Elle retourne tous les tableaux de n+1 mots consécutifs 
possibles et ne sera généralement pas unique pour une 
bonne taille de corpus.
*/
function grouper(mots, n) {
    var vides = Array(n).fill(""),
        tableauComplet = vides.concat(mots, vides),
        resultat = [];

    for (var i = 0; i <= mots.length; i++)
        resultat.push(tableauComplet.slice(i, i + n + 1))
    return resultat;
}


/* 
Cette fonction reçoit un tableau de mots et va nous rendre une série de 
tableaux de taille 2 qui contiendront une suite de n mots et le mot suivant
possible. Ils ne seront pas nécéssairement uniques.
 */
function megaGrouper(mots, n) {
    var megaGroupes = grouper(mots, n),
        resultat = megaGroupes.map(function (x) {
            var i = debutPropre(x);
            return [x.slice(i, x.length-1).join(" "), 
                x.slice(-1)[0]];
        });
    return resultat;
}


/* 
Cette fonction reçoit un tableau de mots et retourne le premier index du dit 
tableau qui n'est pas un 
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
        nombreHasard = Math.random(), 
        cumul = 0;
    if (prochainsPossibles.length == 0)
        return null;
    for (cas of prochainsPossibles) {
        cumul += cas.prob;
        if (cumul > nombreHasard)
            return cas.mot;
    }
};


/* exemple d'appel de genererProchainMot:
// genererProchainMot(modeleTaco, "taco")
var modeleTaco = creerModele("Je suis le plus taco des taco, j'aime tous le taco du monde et je taco taco avec toi taco!");
var modeleTest = creerModele('A B C.\nA B A.\nC B A.');*/



var genererPhrase = function(modele, maxNbMots) {
    var prochainMot,
        phrase = [];
        motActuel = "";

    for (var i = 0; i < maxNbMots; i++) {
        prochainMot = genererProchainMot(modele, motActuel);
        if (prochainMot === null)
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
 */
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

    return paragraphes;
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
        '[{"mot":"tacos","prob":1}],[{"mot":"","prob":1}]]}',
    new Error().stack);

    // tests pour la méthode Array.prototype.indexOfMot()
    console.assert([{mot: "hey", prob: 2}, {mot: "taco", prob: 3}]
        .indexOfMot("hey") == 0,
    new Error().stack);
    console.assert([{mot: "hey", prob: 2}, {mot: "taco", prob: 3}]
        .indexOfMot("taco") == 1,
    new Error().stack);

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
        '{"mot":"naa","prob":0.5}],[{"mot":"","prob":1}]]',
    new Error().stack);

    // tests pour toutSaufLesDerniers()
    console.assert("" + toutSaufLesDerniers([["", "b"], ["sponge", "bob"]]) == 
        ",sponge",
    new Error().stack);

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
