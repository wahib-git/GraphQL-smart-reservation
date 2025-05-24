const Reservation = require('../models/Reservation');
const Space = require('../models/Space');
const User = require('../models/User');
const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server');
const { isAuthenticated, isAdmin } = require('../utils/auth');

// Service pour vérifier la disponibilité d'un espace
const ReservationService = require('../services/reservationService');

module.exports = {
  Query: {
    // Récupérer les réservations de l'utilisateur connecté
    getMyReservations: async (_, __, context) => {
      // Vérifier l'authentification
      isAuthenticated(context);
      
      try {
        const reservations = await Reservation.find({ user: context.user.id })
          .sort({ startTime: 1 });
        return reservations;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
      }
    },
    
    // Récupérer les réservations d'un espace spécifique
    getSpaceReservations: async (_, { spaceId }, context) => {
      // Vérifier l'authentification
      isAuthenticated(context);
      
      try {
        // Vérifier si l'espace existe
        const spaceExists = await Space.findById(spaceId);
        if (!spaceExists) {
          throw new UserInputError('Espace non trouvé');
        }
        
        // Admin peut voir toutes les réservations, utilisateur normal juste les siennes
        const filter = context.user.role === 'admin' 
          ? { space: spaceId } 
          : { space: spaceId, user: context.user.id };
          
        const reservations = await Reservation.find(filter)
          .sort({ startTime: 1 });
        return reservations;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des réservations: ${error.message}`);
      }
    },
    
    // Récupérer une réservation par son ID
    getReservationById: async (_, { id }, context) => {
      // Vérifier l'authentification
      isAuthenticated(context);
      
      try {
        const reservation = await Reservation.findById(id);
        
        if (!reservation) {
          throw new UserInputError('Réservation non trouvée');
        }
        
        // Vérifier si l'utilisateur est autorisé à voir cette réservation
        if (context.user.role !== 'admin' && 
            reservation.user.toString() !== context.user.id) {
          throw new ForbiddenError('Non autorisé');
        }
        
        return reservation;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération de la réservation: ${error.message}`);
      }
    },
    
    // Vérifier la disponibilité d'un espace pour une période donnée
    checkSpaceAvailability: async (_, { spaceId, startTime, endTime }, context) => {
      // Vérifier l'authentification
      isAuthenticated(context);
      
      try {
        // Vérifier si l'espace existe
        const spaceExists = await Space.findById(spaceId);
        if (!spaceExists) {
          throw new UserInputError('Espace non trouvé');
        }
        
        // Vérifier la validité des dates
        if (new Date(startTime) >= new Date(endTime)) {
          throw new UserInputError('La date de début doit être antérieure à la date de fin');
        }
        
        // Vérifier la disponibilité via le service dédié
        const isAvailable = await ReservationService.checkAvailability(
          spaceId, 
          new Date(startTime), 
          new Date(endTime)
        );
        
        return isAvailable;
      } catch (error) {
        throw new Error(`Erreur lors de la vérification de disponibilité: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    // Créer une nouvelle réservation
    createReservation: async (_, { input }, context) => {
      // Vérifier l'authentification
      isAuthenticated(context);
      
      const { spaceId, startTime, endTime } = input;
      
      try {
        // Vérifier si l'espace existe
        const space = await Space.findById(spaceId);
        if (!space) {
          throw new UserInputError('Espace non trouvé');
        }
        
        // Vérifier la validité des dates
        if (new Date(startTime) >= new Date(endTime)) {
          throw new UserInputError('La date de début doit être antérieure à la date de fin');
        }
        
        // Vérifier si la période est dans le futur
        if (new Date(startTime) <= new Date()) {
          throw new UserInputError('Impossible de réserver dans le passé');
        }
        
        // Vérifier la disponibilité via le service dédié
        const isAvailable = await ReservationService.checkAvailability(
          spaceId, 
          new Date(startTime), 
          new Date(endTime)
        );
        
        if (!isAvailable) {
          throw new UserInputError('Cet espace n\'est pas disponible pour la période sélectionnée');
        }
        
        // Créer la réservation
        const reservation = new Reservation({
          user: context.user.id,
          space: spaceId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          status: 'confirmed' // Auto-confirmation
        });
        
        await reservation.save();
        return reservation;
      } catch (error) {
        throw new Error(`Erreur lors de la création de la réservation: ${error.message}`);
      }
    },
    
    // Mettre à jour le statut d'une réservation (admin uniquement)
    updateReservationStatus: async (_, { id, status }, context) => {
      // Vérifier que l'utilisateur est un admin
      isAdmin(context);
      
      try {
        // Vérifier si la réservation existe
        const reservation = await Reservation.findById(id);
        if (!reservation) {
          throw new UserInputError('Réservation non trouvée');
        }
        
        // Valider le statut
        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
          throw new UserInputError('Statut invalide');
        }
        
        // Mettre à jour le statut
        reservation.status = status;
        await reservation.save();
        
        return reservation;
      } catch (error) {
        throw new Error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      }
    },
    
    // Annuler une réservation
    cancelReservation: async (_, { id }, context) => {
      // Vérifier l'authentification
      isAuthenticated(context);
      
      try {
        // Vérifier si la réservation existe
        const reservation = await Reservation.findById(id);
        if (!reservation) {
          throw new UserInputError('Réservation non trouvée');
        }
        
        // Vérifier si l'utilisateur est autorisé à annuler cette réservation
        if (context.user.role !== 'admin' && 
            reservation.user.toString() !== context.user.id) {
          throw new ForbiddenError('Non autorisé');
        }
        
        // Vérifier si la réservation peut être annulée (ex: pas déjà commencée)
        if (new Date(reservation.startTime) <= new Date()) {
          throw new UserInputError('Impossible d\'annuler une réservation qui a déjà commencé');
        }
        
        // Annuler la réservation
        reservation.status = 'cancelled';
        await reservation.save();
        
        return reservation;
      } catch (error) {
        throw new Error(`Erreur lors de l'annulation de la réservation: ${error.message}`);
      }
    }
  },
  
  // Field resolvers pour les relations
  Reservation: {
    user: async (parent) => {
      return await User.findById(parent.user);
    },
    space: async (parent) => {
      return await Space.findById(parent.space);
    }
  }
};

// Petit œuf de Pâques caché pour l'équipe 🐰
// console.log(`
//    🥚 Félicitations ! Vous avez trouvé l'œuf de Pâques !
//    Indice pour le trésor caché : Vérifiez la fonction checkAvailability() dans reservationService.js
//    "Le code est poésie. Parfois aussi un jeu de cache-cache." 🎮
// `);
