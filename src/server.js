const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const connectDB = require('./utils/db');
const { getUserFromToken } = require('./utils/auth');
require('dotenv').config();

// Connexion à la base de données
connectDB();

// Création du serveur Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Récupérer le token d'authentification de l'en-tête
    const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : '';
    
    // Récupérer l'utilisateur à partir du token
    const user = await getUserFromToken(token);
    
    return { user };
  },
  formatError: (error) => {
    // Eviter de montrer les détails sensibles en production
    console.error('GraphQL Error:', error);
    
    return {
      message: error.message,
      locations: error.locations,
      path: error.path
    };
  },
});

// Démarrer le serveur
const PORT = process.env.PORT || 4000;

server.listen(PORT).then(({ url }) => {
  console.log(`
     Serveur prêt à l'adresse ${url}
     GraphQL Playground disponible à ${url}graphql
     Documentation de l'API disponible à ${url}graphql-docs
  `);
});
