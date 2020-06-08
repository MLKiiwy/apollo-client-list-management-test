import {
  gql,
} from '@apollo/client';

const typeDefs = gql`
  extend type Element {
    optimisticUi: Boolean!
  }

  directive @queue(
    name: String!,
  ) on OBJECT | FIELD_DEFINITION
`;

export default typeDefs;
