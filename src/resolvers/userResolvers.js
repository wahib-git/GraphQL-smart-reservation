const User = require('../models/User');
const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server');
const { generateToken, isAuthenticated, isAdmin } = require('../utils/auth');

module.exports = {
  Query: {
    // Récupérer l'utilisateur connecté
    me: async (_, __, context) => {
      isAuthenticated(context);
      
      try {
        const user = await User.findById(context.user.id);
        if (!user) {
          throw new Error('Utilisateur non trouvé');
        }
        return user;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
      }
    },
    
    // Récupérer tous les utilisateurs (admin uniquement)
    getUsers: async (_, __, context) => {
      isAdmin(context);
      
      try {
        return await User.find({}).sort({ createdAt: -1 });
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
      }
    },
    
    // Récupérer un utilisateur par son ID (admin uniquement)
    getUserById: async (_, { id }, context) => {
      isAdmin(context);
      
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new UserInputError('Utilisateur non trouvé');
        }
        return user;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    // Inscription d'un nouvel utilisateur
    register: async (_, { input }) => {
      const { name, email, password } = input;
      
      try {
        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new UserInputError('Cet email est déjà utilisé');
        }
        
        // Créer un nouvel utilisateur
        const user = new User({
          name,
          email,
          password,
          role: 'member' // Par défaut, tous les nouveaux utilisateurs sont des membres
        });
        
        await user.save();
        
        // Générer un token JWT
        const token = generateToken(user);
        
        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Erreur lors de l'inscription: ${error.message}`);
      }
    },
    
    // Connexion d'un utilisateur
    login: async (_, { input }) => {
      const { email, password } = input;
      
      try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
          throw new UserInputError('Email ou mot de passe incorrect');
        }
        
        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          throw new UserInputError('Email ou mot de passe incorrect');
        }
        
        // Générer un token JWT
        const token = generateToken(user);
        
        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Erreur lors de la connexion: ${error.message}`);
      }
    }
  }
};
