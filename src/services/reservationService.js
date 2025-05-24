const Reservation = require('../models/Reservation');

class ReservationService {
  /**
   * Vérifie si un espace est disponible pour une période donnée
   * @param {string} spaceId - ID de l'espace
   * @param {Date} startTime - Date et heure de début
   * @param {Date} endTime - Date et heure de fin
   * @returns {Promise<boolean>} - true si disponible, false sinon
   */
  static async checkAvailability(spaceId, startTime, endTime) {
    try {
      // Chercher des réservations qui se chevauchent avec la période demandée
      const overlappingReservations = await Reservation.find({
        space: spaceId,
        status: { $ne: 'cancelled' }, // Ignorer les réservations annulées
        $or: [
          // Cas 1: La réservation existante englobe complètement la nouvelle période
          { 
            startTime: { $lte: startTime }, 
            endTime: { $gte: endTime } 
          },
          // Cas 2: Le début de la réservation existante est dans la nouvelle période
          { 
            startTime: { $gte: startTime, $lt: endTime } 
          },
          // Cas 3: La fin de la réservation existante est dans la nouvelle période
          { 
            endTime: { $gt: startTime, $lte: endTime } 
          },
          // Cas 4: La nouvelle période englobe complètement la réservation existante
          { 
            startTime: { $gte: startTime, $lte: endTime },
            endTime: { $gte: startTime, $lte: endTime }
          }
        ]
      });
      
      // L'espace est disponible s'il n'y a pas de réservations qui se chevauchent
      return overlappingReservations.length === 0;
    } catch (error) {
      throw new Error(`Erreur lors de la vérification de disponibilité: ${error.message}`);
    }
  }
  
  /**
   * Calcule le prix total d'une réservation
   * @param {number} hourlyRate - Tarif horaire de l'espace
   * @param {Date} startTime - Date et heure de début
   * @param {Date} endTime - Date et heure de fin
   * @returns {number} - Prix total de la réservation
   */
  static calculateReservationPrice(hourlyRate, startTime, endTime) {
    // Calculer la durée en heures
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Calcul du prix (arrondi à 2 décimales)
    return Math.round(hourlyRate * durationHours * 100) / 100;
  }
  
  /**
   * Récupère les statistiques d'occupation d'un espace
   * @param {string} spaceId - ID de l'espace
   * @param {Date} startDate - Date de début de la période
   * @param {Date} endDate - Date de fin de la période
   * @returns {Promise<Object>} - Statistiques d'occupation
   */
  static async getOccupancyStats(spaceId, startDate, endDate) {
    try {
      // Récupérer toutes les réservations pour cet espace dans la période donnée
      const reservations = await Reservation.find({
        space: spaceId,
        status: 'confirmed',
        startTime: { $gte: startDate },
        endTime: { $lte: endDate }
      });
      
      // Calculer la durée totale réservée en heures
      let totalHoursBooked = 0;
      
      reservations.forEach(reservation => {
        const durationMs = reservation.endTime.getTime() - reservation.startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        totalHoursBooked += durationHours;
      });
      
      // Calculer le nombre total d'heures disponibles dans la période
      const totalPeriodMs = endDate.getTime() - startDate.getTime();
      const totalAvailableHours = totalPeriodMs / (1000 * 60 * 60);
      
      // Calculer le taux d'occupation (%)
      const occupancyRate = (totalHoursBooked / totalAvailableHours) * 100;
      
      return {
        totalReservations: reservations.length,
        totalHoursBooked: Math.round(totalHoursBooked * 10) / 10, // Arrondi à 1 décimale
        occupancyRate: Math.round(occupancyRate * 10) / 10 // Arrondi à 1 décimale
      };
    } catch (error) {
      throw new Error(`Erreur lors du calcul des statistiques: ${error.message}`);
    }
  }
}



module.exports = ReservationService;
