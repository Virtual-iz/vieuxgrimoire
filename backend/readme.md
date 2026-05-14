# Mon Vieux Grimoire – API Backend

API REST Node.js / Express pour gérer une collection de livres. 
L’objectif du site “Mon Vieux Grimoire” est de donner la possibilité aux lecteurs de créer des livres, de les noter et de consulter les livres existants ainsi que leurs notes.

-------------

## Spécifications techniques

- Le header contient un menu avec un bouton connection/déconnection (qui permet aussi l'inscription)

● une page pour permettre l’inscription / la connexion des utilisateurs. Cette page contient deux champs de saisie : “mail” et “mot de passe”, et deux boutons :“inscription” et “connexion”. Pas de header ni footer sur cette page.

● une page d’accueil présentant la liste de l’ensemble des ouvrages ayant été ajoutés par les utilisateurs. Cette page est visible par tous les visiteurs, qu’ils soient connectés ou non. Pour chaque ouvrage apparaissent son image et son titre.

● une page “livre” présentant toutes les informations rattachées à un livre : image, titre, auteur, année, genre et note moyenne sur 5. 
Le créateur met une première note, et un utilisateur non créateur doit avoir la possibilité de rajouter sa propre note. L'app fait une moyenne de toutes les notes utilisateurs.
Si l’utilisateur qui consulte un livre est le créateur de celui-ci, cet utilisateur aura 2 boutons supplémentaires à sa disposition, un bouton pour supprimer le livre, et un autre pour le modiﬁer.

● une page permettant aux utilisateurs d’ajouter de nouveaux livres à la plateforme en lui renseignant toutes les informations nécessaires : image (champ d’upload d’une image), titre, auteur, année et genre.
Un bouton de validation permet de conﬁrmer la création du
livre une fois toutes les informations saisies.
Cette page n'est pas visible hors connexion.

-------------

### Généralités de l'API

▶️ Base de donnée MongoDB + Mongoose
- Mongoose pour garantir que les adresses electroniques utilisateurs sont uniques et signaler les erreurs

▶️ Création et authentification d’utilisateurs avec :
- Authentification JWT sécurisée pour protéger les routes
- Hash des mots de passe via Bcrypt

▶️ CRUD 
Création, lecture, modification et suppression des livres, avec contrôle de propriété pour chaque action.
- Protection auth des routes selon l’utilisateur

▶️ Upload et optimisation d’images
- upload des images envoyées par l'utilisateur connecté sur stockage local avec Multer, renommage, 
- converties au format WebP avec Sharp

▶️ Système de notation / rating sécurisé
Chaque utilisateur peut noter un livre une seule fois, et la note moyenne est recalculée côté serveur pour éviter toute triche.

-------------

#### Structure du projet

backend/
│
├── controllers/
│   ├── books-ctrl.js      # Logique métier pour les livres
│   └── user-ctrl.js       # Logique métier pour les utilisateurs
│
├── routes/
│   ├── books-routes.js    # Endpoints pour les livres
│   └── user-routes.js     # Endpoints pour l'auth
│
├── models/
│   ├── Book.js            # Schéma MongoDB pour les livres
│   └── User.js            # Schéma MongoDB pour les utilisateurs
│
├── middleware/
│   ├── auth.js            # Vérification JWT et sécurité des routes
│   ├── multer-config.js   # Upload des fichiers
│   └── sharp-config.js    # Optimisation des images
│
├── images/                # Dossier contenant les images uploadées
├── app.js                 # Configuration Express et MongoDB
└── server.js              # Création du serveur Node

-------------

##### Routes et usages

▶️ GET/api/books	
    Récupère tous les livres de la database

▶️ GET/api/books/:id	
    Récupère un livre spécifique avec son id

▶️ GET/api/books/bestrating	
    Renvoie un tableau des 3 livres de la base de données ayant la meilleure note moyenne

▶️ POST/api/auth/signup
    Hachage du mot de passe de l'utilisateur, ajout de l'utilisateur à la base de donnée

▶️ POST/api/auth/login	
    Vériﬁcation des informations utilisateur ; renvoie l’_id de l'utilisateur depuis la base de données et un token web JSON signé (contenant également l'_id de l'utilisateur).

▶️ POST/api/books	
    Crée un livre (auth requise). Capture et enregistre l'image, analyse le livre transformé en chaîne de caractères, et l'enregistre dans la base de données en déﬁnissant correctement son ImageUrl.

▶️ POST/api/books/:id/rating	
    Déﬁnit la note pour le user ID fourni entre 0 et 5.
    L'ID de l'utilisateur et la note sont ajoutés au
    tableau "rating" aﬁn de ne pas laisser un utilisateur
    noter deux fois le même livre.
    La note moyenne "averageRating" est tenue à jour, et le livre renvoyé en réponse de la requête.

▶️ PUT/api/books/:id	
    Modifie un livre (auth requise)
    Les modifications et suppressions ne sont possibles que par l’utilisateur propriétaire. Vérifications userId pour modifications/suppressions. S'il ne correspond pas, envoi de « 403: unauthorized request ». 
    Met à jour le livre avec l'_id fourni. Si une image est
    téléchargée, elle est capturée, et l’ImageUrl du livre
    est mise à jour. Si aucun ﬁchier n'est fourni, les
    informations sur le livre se trouvent directement
    dans le corps de la requête (req.body.title,
    req.body.author, etc.). Si un ﬁchier est fourni, le livre
    transformé en chaîne de caractères se trouve dans
    req.body.book. Notez que le corps de la demande
    initiale est vide ; lorsque Multer est ajouté, il renvoie
    une chaîne du corps de la demande basée sur les
    données soumises avec le ﬁchier

▶️ DELETE/api/books/:id	
    Supprime un livre (auth requise)

-------------

###### Installation

▶️ Cloner le projet avec
git clone <url-du-repo>
cd <nom-du-projet>

▶️ Installer les dépendances :
npm install -> base node
npm install express -> framework node pr gestion serveurs
npm install dotenv -> ports et fichier .env
npm install mongoose -> package qui facilite les interactions avec la database MongoDB
npm install mongoose-unique-validator -> gestion des adresses utilisateurs uniques
npm install jsonwebtoken -> jwt = pour générer des tokens
npm install bcrypt -> hash des mp
npm install fs -> (filesystem) et sa méthode unlink pour gérer la suppression des fichiers
npm install multer -> stockage local des images
npm install sharp -> convertion des images en .webp, plus léger

▶️ Créer un fichier .env à la racine contenant les informations communiquées :
CONNECTION_STRING=<connection_db>
PORT=4000
JWT_SECRET=<votre_secret>


▶️ Lancer le serveur : npm run start


