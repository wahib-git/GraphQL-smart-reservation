const Space = require('../models/Space');
const { UserInputError } = require('apollo-server');
const { isAuthenticated, isAdmin } = require('../utils/auth');

module.exports = {
  Query: {
    // Récupérer tous les espaces avec filtrage optionnel par type
    getSpaces: async (_, { type }) => {
      try {
        const filter = {};
        
        // Filtrer par type si spécifié
        if (type) {
          filter.type = type;
        }
        
        // Ne retourner que les espaces actifs
        filter.isActive = true;
        
        return await Space.find(filter).sort({ name: 1 });
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des espaces: ${error.message}`);
      }
    },
    
    // Récupérer un espace par son ID
    getSpaceById: async (_, { id }) => {
      try {
        const space = await Space.findById(id);
        
        if (!space) {
          throw new UserInputError('Espace non trouvé');
        }
        
        return space;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération de l'espace: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    // Créer un nouvel espace (admin uniquement)
    createSpace: async (_, { input }, context) => {
      // Vérifier que l'utilisateur est un admin
      isAdmin(context);
      
      const { name, type, capacity, amenities, hourlyRate, description } = input;
      
      try {
        // Vérifier si un espace avec ce nom existe déjà
        const existingSpace = await Space.findOne({ name });
        if (existingSpace) {
          throw new UserInputError('Un espace avec ce nom existe déjà');
        }
        
        // Créer un nouvel espace
        const space = new Space({
          name,
          type,
          capacity,
          amenities,
          hourlyRate,
          description,
          isActive: true
        });
        
        await space.save();
        return space;
      } catch (error) {
        throw new Error(`Erreur lors de la création de l'espace: ${error.message}`);
      }
    },
    
    // Mettre à jour un espace (admin uniquement)
    updateSpace: async (_, { id, input }, context) => {
      // Vérifier que l'utilisateur est un admin
      isAdmin(context);
      
      try {
        // Vérifier si l'espace existe
        const space = await Space.findById(id);
        if (!space) {
          throw new UserInputError('Espace non trouvé');
        }
        
        // Vérifier si le nom est déjà utilisé par un autre espace
        if (input.name && input.name !== space.name) {
          const existingSpace = await Space.findOne({ name: input.name });
          if (existingSpace) {
            throw new UserInputError('Un espace avec ce nom existe déjà');
          }
        }
        
        // Mettre à jour l'espace
        const updatedSpace = await Space.findByIdAndUpdate(
          id,
          { $set: input },
          { new: true, runValidators: true }
        );
        
        return updatedSpace;
      } catch (error) {
        throw new Error(`Erreur lors de la mise à jour de l'espace: ${error.message}`);
      }
    },
    
    // Supprimer un espace (désactivation logique) (admin uniquement)
    deleteSpace: async (_, { id }, context) => {
      // Vérifier que l'utilisateur est un admin
      isAdmin(context);
      
      try {
        // Vérifier si l'espace existe
        const space = await Space.findById(id);
        if (!space) {
          throw new UserInputError('Espace non trouvé');
        }
        
        // Désactiver l'espace (suppression logique)
        await Space.findByIdAndUpdate(
          id,
          { $set: { isActive: false } }
        );
        
        return true;
      } catch (error) {
        throw new Error(`Erreur lors de la suppression de l'espace: ${error.message}`);
      }
    }
  }
};
