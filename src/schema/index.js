const { gql } = require('apollo-server');

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: Date!
  }

  type Space {
    id: ID!
    name: String!
    type: String!
    capacity: Int!
    amenities: [String]
    hourlyRate: Float!
    description: String
    isActive: Boolean!
  }

  type Reservation {
    id: ID!
    user: User!
    space: Space!
    startTime: Date!
    endTime: Date!
    status: String!
    createdAt: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input SpaceInput {
    name: String!
    type: String!
    capacity: Int!
    amenities: [String]
    hourlyRate: Float!
    description: String
  }

  input ReservationInput {
    spaceId: ID!
    startTime: Date!
    endTime: Date!
  }

  type Query {
    # User queries
    me: User
    getUsers: [User]!
    getUserById(id: ID!): User

    # Space queries
    getSpaces(type: String): [Space]!
    getSpaceById(id: ID!): Space

    # Reservation queries
    getMyReservations: [Reservation]!
    getSpaceReservations(spaceId: ID!): [Reservation]!
    getReservationById(id: ID!): Reservation
    checkSpaceAvailability(spaceId: ID!, startTime: Date!, endTime: Date!): Boolean!
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Space mutations
    createSpace(input: SpaceInput!): Space!
    updateSpace(id: ID!, input: SpaceInput!): Space!
    deleteSpace(id: ID!): Boolean!

    # Reservation mutations
    createReservation(input: ReservationInput!): Reservation!
    updateReservationStatus(id: ID!, status: String!): Reservation!
    cancelReservation(id: ID!): Reservation!
  }
`;

module.exports = typeDefs;