//// Auteurs:
// Emma Parent-Senez, 20071506
// Antoine Colson-Ratelle, 990432
//Et la personne à la base du code donné
/*
Ce code a été conçu pour le vendredi 13 décembre 2019 et à la section demandée
sert à afficher le contenu désiré sur une page html 
*/

'use strict';

var http = require("http");
var fs = require('fs');
var urlParse = require('url').parse;
var pathParse = require('path').parse;
var querystring = require('querystring');
var crypto = require('crypto');
var request = require('sync-request');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

// Votre librairie est incluse ici
var markov = require('./markov.js');

// Fonctions exportées
var creerModele = markov.creerModele;
var genererParagraphes = markov.genererParagraphes;

// Liste de premières phrases possibles pour les articles
// Ajoutez-en si vous avez des idées!
var premieresPhrases = [
    "<strong>{{titre}}</strong> est un animal aquatique nocturne.",
    "<strong>{{titre}}</strong> (du grec ancien <em>\"{{titre-1}}\"</em> et <em>\"{{titre-2}}\"</em>), est le nom donné par Aristote à la vertu politique.",
    "<strong>{{titre}}</strong>, né le 30 août 1987 à Portland (Oregon), est un scénariste américain.",
    "<strong>{{titre}}</strong>, née le 30 septembre 1982 à Québec, est une femme politique québécoise.",
    "<strong>{{titre}}</strong> est défini comme « l'ensemble des règles imposées aux membres d'une société pour que leurs rapports sociaux échappent à l'arbitraire et à la violence des individus et soient conformes à l'éthique dominante ».",
    "<strong>{{titre}}</strong>, néologisme du XXe siècle, attesté en 1960, composite du grec ancien <em>{{titre-1}}</em> et du latin <em>{{titre-2}}</em>, est le principe déclencheur d'événements non liés à une cause connue.",
    "<strong>{{titre}}</strong> est une espèce fossile d'euryptérides ressemblant aux arachnides, appartenant à la famille des <em>{{titre-1}}</em>.",
    "<strong>{{titre}}</strong>, né le 25 juin 1805 à Lyon et mort le 12 février 1870 à Versailles, est un peintre animalier français.",
    "<strong>{{titre}}</strong> est le titre d'un épisode de la série télévisée d'animation Les Simpson. Il s'agit du quatre-vingt-dix-neuvième épisode de la soixante-huitième saison et du 8 615e épisode de la série.",
    "<strong>{{titre}}</strong>, composé de <em>{{titre-1}}</em>- et de -<em>{{titre-2}}</em>, consiste en l'étude d'une langue et de sa littérature à partir de documents écrits."
];

// --- Utilitaires ---
var readFile = function (path, binary) {
    if(!binary)
        return fs.readFileSync(path).toString('utf8');
    return fs.readFileSync(path, {encoding: 'binary'});
};

var writeFile = function (path, texte) {
    fs.writeFileSync(path, texte);
};

// ---------------------------------------------------------
//  Fonctions pour communiquer avec Wikipédia
//  (trouver des articles au hasard et extraire des images)
// ---------------------------------------------------------

/*
 * Requête *synchrone* pour obtenir du JSON depuis un API
 * quelconque.
 *
 * NOTEZ : ce code fait l'affaire pour ce TP, mais ne serait pas
 * acceptable dans un vrai serveur web. Pour simplifier le travail à
 * faire dans ce TP, on va néanmoins utiliser cette approximation, qui
 * serait beaucoup trop lente à exécuter sur un vrai site pour ne pas
 * que le site "laggue".
 */
var jsonRequestSync = function(url) {
    try {
        var response = request('GET', url);
    } catch(e) {
        return false;
    }

    if(response.statusCode != '200') {
        console.error(new Error("Page web invalide").stack);
        return false;
    }

    try {
        return JSON.parse(response.body.toString());
    } catch(e) {
        console.error(new Error("Page web invalide").stack);
    }
};

/*
 * Retourne un tableau contenant `n` titres de pages au hasard de
 * Wikipédia français
 */
var getRandomPageTitles = function(n) {
    var req = jsonRequestSync('https://fr.wikipedia.org/w/'+
        'api.php?action=query&list=random&rnnamespace=0&rnlimit=' +
        n + '&format=json');
    if(!req) {
        return Array(n).fill("Pas d'internet");
    }

    return req.query.random.map(function(x) {
        return x.title;
    });
};

var md5 = function(data) {
    return crypto.createHash('md5').update(data).digest("hex");
};

/*
 * Découpe le nom de fichier donné par Wikipédia pour l'image et
 * retourne son URL
 */
var fileUrl = function(wikipediaName) {
    var filename = wikipediaName.slice('Fichier:'.length).split(' ').join('_');

    var hash = md5(filename).slice(0, 2);

    return "https://upload.wikimedia.org/wikipedia/commons/" + 
        hash[0] + '/' + hash + '/' + filename;
};

/*
 * Retourne l'URL de la première image de l'article Wikipédia dont le
 * titre est title.
 */
var getPageFirstImage = function(title) {
    var encodedTitle = encodeURIComponent(title);

    var pageUrl = "https://fr.wikipedia.org/w/api.php?action=query&titles=" +
        encodedTitle + "&format=json&prop=images&imlimit=30";

    var req = jsonRequestSync(pageUrl);

    if(!req) {
        return undefined;
    }

    var pages = req.query.pages;

    if(typeof(pages[-1]) === "undefined") {
        var page = Object.values(pages)[0];

        if(typeof(page.images) === 'undefined') {
            return false;
        }

        var images = page.images.map(function(img) {
            return img.title;
        });

        images = images.filter(function(x) {
            var parts = x.split('.');
            return ['jpg', 'png', 'jpeg', 'gif'].indexOf(parts[parts.length - 1]) !== -1;
        });

        if(images.length > 0)
            return images[0];
    }

    return false;
};

/*
 * Retourne une image de Wikipédia Français pour l'article nommé
 * title. Si l'article existe, et comporte des images, cette fonction
 * retourne la première image de l'article (selon l'ordre retourné par
 * l'API de Wikipédia), sinon cette fonction trouve une image au
 * hasard.
 */
var getImage = function(title) {

    var img = false;
    var url;
    do {

        if(typeof(title) !== 'undefined') {
            // 1. Vérifier si la page Wikipédia de "title" existe
            img = getPageFirstImage(title);
        }

        if(!img) {
            do {
                // 2. Lister 10 articles au hasard de Wikipédia
                var randomPages = getRandomPageTitles(10);

                for(var i=0; i<randomPages.length; i++) {
                    img = getPageFirstImage(randomPages[i]);
                    if(img !== false) {
                        break;
                    }
                }
            } while(img === false);
        }

        if(img === undefined) {
            // Pas d'internet
            return '/no-internet.png';
        }

        url = fileUrl(img);

        title = undefined;
        img = false;

        try {
            var response = request('HEAD', url);

            // Image trop petite, on en trouve une autre
            if(response.headers['content-length'] < 30000) {
                response = false;
                continue;
            }
        } catch(e) {
            continue;
        }

    } while(!response || response.statusCode != '200');

    return url;
};

// --------------------
//  Gestion du serveur
// --------------------
var port = 1337;
var hostUrl = 'http://localhost:'+port+'/';
var defaultPage = '/index.html';

var mimes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
};

// --- Server handler ---
var redirect = function (reponse, path, query) {
    var newLocation = path + (query == null ? '' : '?' + query);
    reponse.writeHeader(302, {'Location' : newLocation });
    reponse.end('302 page déplacée');
};

var getDocument = function (url) {
    var pathname = url.pathname;
    var parsedPath = pathParse(url.pathname);
    var result = { data: null, status: 200, type: null };

    if(Object.keys(mimes).indexOf(parsedPath.ext) != -1) {
        result.type = mimes[parsedPath.ext];
    } else {
        result.type = 'text/plain';
    }

    try {
        if(['.png', '.jpg'].indexOf(parsedPath.ext) !== -1) {
            result.data = readFile('./public' + 
                pathname, {encoding: 'binary'});
            result.encoding = 'binary';
        } else {
            result.data = readFile('./public' + pathname);
        }
        console.log('['+new Date().toLocaleString('iso') + 
            "] GET " + url.path);
    } catch (e) {
        // File not found.
        console.log('['+new Date().toLocaleString('iso') + "] GET " +
            url.path + ' not found');
        result.data = readFile('template/error404.html');
        result.type = 'text/html';
        result.status = 404;
    }

    return result;
};

var sendPage = function (reponse, page) {
    reponse.writeHeader(page.status, {'Content-Type' : page.type});
    reponse.end(page.data, page.encoding || 'utf8');
};



/*
-------------------------------------------------------------------------------
                           _____ ___  ____   ___
                          |_   _/ _ \|  _ \ / _ \
                            | || | | | | | | | | |
                            | || |_| | |_| | |_| |
                            |_| \___/|____/ \___/

                   Le code à compléter se trouve ci-dessous
-------------------------------------------------------------------------------
*/

// variable globale du modèle
var modele = creerModele(readFile("corpus/hp"), true)


// -------------------------------------
//  Logique de l'application ci-dessous
//    LE SEUL CODE QUE VOUS AVEZ À
//       MODIFIER EST CI-DESSOUS
// -------------------------------------

/* Cette fonction sert a remplacer des etiquettes des pages html 
 * fournies pour les valeurs désirées. Elle est utilisée maintes fois.
 */
var substituerEtiquette = function (texte, etiquette, valeur) {
    var valeurCorrigee; 
    if (etiquette[2] != "{")
        valeurCorrigee = Entities.encode(valeur); 
    else 
        valeurCorrigee = valeur;

    var resultat = texte.split(etiquette).join(valeurCorrigee);
    return resultat;
};


/* 
 * Fonction qui va chercher notre page index(accueil) et va remplacer les 
 * étiquettes de départ avec les valeurs appropriées comme afficher une liste
 * d'articles récents(ici randomisée) et une image du jour
 */
var getIndex = function () {
    var template = readFile("template/index.html");

    var titres = getRandomPageTitles(20),
        tagDebut = "<li><a href=\"article\\",
        tagFin = "</a></li>",
        liens = Array(20).fill("\">");

    var liensTitres = titres.map(function(elem, i) {
        return tagDebut + elem + liens[i] + elem + tagFin;
    }).join("\n") + "\n";

    var resultat = substituerEtiquette(template, 
        "{{{articles-recents}}}", liensTitres),
        liste = "<ul>\n" + resultat + "</ul>";

    var avecImage = substituerEtiquette(resultat, 
        "{{img}}", getImage());

    //writeFile("test.html", avecImage);
    return avecImage; 
};


/* 
 * Cette fonction ne prend aucun argument. Elle lit la variable
 * globale premieresPhrases, de type Array, puis de ce tableau
 * retourne un des éléments, de type String.
 */
function getPhrase() {
    var index = Math.random() * premieresPhrases.length;
    return premieresPhrases[index >> 0]; // équivalent de floor
}


/*
 * Fonction qui va chercher notre page d'article et la personnalise au titre 
 * désiré avec une image randomisée et utilise la fonction 
 * genererParagraphesi() de notre modele de Markov pour generer du
 * texte aleatoire
 */
var getArticle = function(titre) {

    var template = readFile("template/article.html"),
        avecTitre = substituerEtiquette(template, "{{titre}}", titre),
        avecImage = substituerEtiquette(avecTitre, "{{img}}", 
            getImage(titre));

    var introMoitie1 = substituerEtiquette(getPhrase(),
        "{{titre-1}}", titre.substring(0, titre.length >> 1));
    var introMoitie2 = substituerEtiquette(introMoitie1,
        "{{titre-2}}", titre.substring(titre.length >> 1));
    var introTitre = substituerEtiquette(introMoitie2,
        "{{titre}}", titre);

    //On fait un map sur nos paragraphes pour les baliser correctement
    var paragraphes = genererParagraphes(modele, 4,8,20)
        .map(function(paragraphe){
            return "<p>" + baliserPar(paragraphe) + "</p>\n"; 
        });

    var contenu = introTitre + "\n" + paragraphes.join("\n"),
        article = substituerEtiquette(avecImage, 
            "{{{contenu}}}", contenu);

    return article;
};


/* Fonction qui détermine si un mot de longueur suffisante devrait apparaître 
 * avec une esthétique particulière et si oui lui appelle un balisage
 */
function baliserMot(mot) {
    if (estValide(mot)){
        var uniforme01 = Math.random();
        if (uniforme01 < 0.15) 
            mot = balisage(mot,'strong');
        else if (uniforme01 < 0.3) 
            mot = balisage(mot,'em');
        else if (uniforme01 < 0.45) 
            mot = balisage(mot,'a');
    }
    return mot;
}


//Fonction qui balise les mots passés en paramètres selon le type désiré
var balisage = function(mot,type){
    if(type=='a')
        // Transformer première lettre de mot en maj pour chercher la page?
        return "<a href=/article/"+mot+">"+mot+"</a>";

    else 
        return "<" + type + ">" + mot + "</" + type + ">";
};


//Fonction qui traite les paragraphes pour chercher les bons mots a baliser
function baliserPar(paragraphe) {
    var tabParag = paragraphe.split(" "); 
    var nouveauParag = tabParag.map(function(x){
        if (estValide(x)) return baliserMot(x);
        else return x;
    });
    return nouveauParag. join(" ");
}


/* Reçoit un mot et retourne true s'il a au moins une longueur de 7
 * et est alphabétique. Sinon, retourne false.
 */
function estValide(mot) {
    if (mot.length < 7)
        return false;

    var code;
    for (var i = 0; i < mot.length; i++) {
        code = mot.charCodeAt(i);
        if (!((code < 91 && code > 64) || (code > 96 && code < 123)))
            return false;
    }
    return true; 
}


/*
 * Création du serveur HTTP
 * Note : pas besoin de toucher au code ici (sauf peut-être si vous
 * faites les bonus)
 */
http.createServer(function (requete, reponse) {
    var url = urlParse(requete.url);

    // Redirect to index.html
    if (url.pathname == '/') {
        redirect(reponse, defaultPage);
        return;
    }

    var doc;

    if (url.pathname == defaultPage) {
        // Index
        doc = {status: 200, data: getIndex(), type: 'text/html'};
    } else if(url.pathname == '/random') {
        // Page au hasard
        redirect(reponse, '/article/' + encodeURIComponent(
            getRandomPageTitles(1)[0]));
        return;
    } else {
        var parsedPath = pathParse(url.pathname);

        if(parsedPath.dir == '/article') {
            var title;

            try {
                title = decodeURIComponent(parsedPath.base);
            } catch(e) {
                title = parsedPath.base.split('%20').join(' ');
            }

            /* Force les articles à commencer avec une 
             * majuscule si c'est une lettre */
            var capital = title.charAt(0).toUpperCase() + title.slice(1);
            if(capital != title) {
                redirect(reponse, encodeURIComponent(capital));
                return;
            }

            doc = {status: 200, data: getArticle(title), type: 'text/html'};
        } else {
            doc = getDocument(url);
        }
    }

    sendPage(reponse, doc);
}).listen(port);


function tests(){
    console.assert(substituerEtiquette("hellooooo {{{tacos}}}", 
        "{{{tacos}}}", "<taco>🌮</taco>") == 'hellooooo <taco>🌮</taco>');
    console.assert(substituerEtiquette("hellooooo {{{tacos}}} ", 
        "{{tacos}}", "<taco>🌮</taco>") == 
        'hellooooo {&lt;taco&gt;🌮&lt;/taco&gt;} ');
    console.assert(substituerEtiquette("hellooooo {{{tacos}}} " +
        "would you like {{{tacos}}} ?", "{{{tacos}}}", "<taco>🌮</taco>")
	== 'hellooooo <taco>🌮</taco> would you like <taco>🌮</taco> ?');
	
	console.assert(estValide("jolIRobe")==true);
	console.assert(estValide("jolIRo56be")==false);
	console.assert(estValide("jolIR")==false);
	
	console.assert(balisage("joli", "allo")=="<allo>joli</allo>");
	console.assert(balisage(38,"a")=="<a href=/article/38>38</a>");
	
	//On ne peut pas faire de tests sur getArticle et getIndex.
	
	//On ne fait pas de tests sur baliserPar et baliserMot car ils sont 
	//dépendants de variables aléatoires.
}
tests();

