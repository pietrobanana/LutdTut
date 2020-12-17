import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }
  extend type Mutation {
    signUp(
      username: String!
      email: String!
      password: String!
    ): Token!
    signIn(login: String!, password: String!): Token!
    deleteUser(id: ID!): Boolean!
  }
  type Token {
    token: String!
  }
  type User {
    id: ID!
    username: String!
    email: String!
    role: String
    messages: [Message!]
  }
`;

//The me is an object type User which also consists of id, username, email, etc.
  //These fields (id, username, email, etc.) are scalar types. These are defineds as STRINGS, BOOLEANS, INTS, etc.