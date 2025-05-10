# Système de Réservation Intelligent pour Espaces de Coworking

Ce projet est une API GraphQL complète pour gérer les réservations d'espaces de coworking, développée avec Node.js, Apollo Server et MongoDB.

## Fonctionnalités

- 👤 **Gestion des utilisateurs**: Inscription, connexion, authentification JWT
- 🏢 **Gestion des espaces**: Création, modification et suppression d'espaces de travail
- 📅 **Système de réservation**: Réservation d'espaces avec vérification de disponibilité en temps réel
- 🔐 **Sécurité**: Autorisations basées sur les rôles (admin, membre)
- 🧪 **Gestion des conflits**: Validation robuste pour éviter les doubles réservations

## Prérequis

- Node.js (v14+ recommandé)
- MongoDB (v4+ recommandé)
- npm 

## Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/wahib-git/GraphQL-smart-reservation.git
   cd GraphQL-smart-reservation
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env` à la racine du projet avec les variables suivantes:

   ```
   MONGODB_URI=uri de votre base de données
   JWT_SECRET=votre secret jwt
   port= 4000
   ```

4. **Démarrer le serveur**

   ```bash
   # Mode développement
   npm run dev

   # Mode production
   npm start
   ```

5. **Accéder au GraphQL Playground**
   Ouvrez votre navigateur et accédez à `http://localhost:4000/graphql`

## Structure du Projet

```
project/
├── src/
│   ├── models/           # Définition des modèles Mongoose
│   ├── schema/           # Schémas GraphQL
│   ├── resolvers/        # Logique de résolution GraphQL
│   ├── services/         # Logique métier
│   ├── utils/            # Fonctions utilitaires
│   └── index.js          # Point d'entrée
├── tests/                # Tests unitaires et d'intégration
├── .env                  # Variables d'environnement
└── README.md             # Documentation
```



## Sécurité et Authentification

Pour les requêtes qui nécessitent une authentification, ajoutez un en-tête `Authorization` avec la valeur `Bearer <votre_token>` où `<votre_token>` est le token JWT obtenu lors de l'inscription ou de la connexion.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## Licence

_Développé dans le cadre d'un projet académique sur les web services._
