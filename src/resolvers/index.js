const userResolvers = require('./userResolvers');
const spaceResolvers = require('./spaceResolvers');
const reservationResolvers = require('./reservationResolvers');
const { GraphQLScalarType, Kind } = require('graphql');

// Custom scalar for Date
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime(); // Convert Date to timestamp
  },
  parseValue(value) {
    return new Date(value); // Convert timestamp to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert AST value to Date
    }
    return null;
  },
});

const resolvers = {
  Date: dateScalar,
  Query: {
    ...userResolvers.Query,
    ...spaceResolvers.Query,
    ...reservationResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...spaceResolvers.Mutation, 
    ...reservationResolvers.Mutation,
  },
  // Add any field resolvers if needed
  Reservation: {
    user: reservationResolvers.Reservation.user,
    space: reservationResolvers.Reservation.space,
  }
};

module.exports = resolvers;