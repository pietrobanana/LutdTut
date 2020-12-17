import { gql } from 'apollo-server-express';

import userSchema from './user';
import messageSchema from './message';

const linkSchema = gql`
  scalar Date
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, userSchema, messageSchema];

//the GraphQL schemas are used to make data available for reading and writing. 
//The schemas consist of Type definitions, starting with a mandatory top level which is Query type for reading data.
    //Followed The query type are the fields and nested fields. 