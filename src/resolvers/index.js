const userResolvers = require("./userResolvers");
const spaceResolvers = require("./spaceResolvers");
const reservationResolvers = require("./reservationResolvers");
const { GraphQLScalarType, Kind } = require("graphql");

// Custom scalar for Date
const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value) {
    // Accepte timestamp ou string ISO
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return isNaN(date) ? null : date;
    }
    return null;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      const date = new Date(ast.value);
      return isNaN(date) ? null : date;
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
  },
};

module.exports = resolvers;
