const { gql } = require('apollo-server');

const typeDefs = gql`
    type Element {
    id: Int!
    text: String!
    }

    type Structure {
    id: String!
    elements: [Element!]
    }

    type List {
    id: String!
    structure: Structure!
    }

    input CreateElementInput {
    id: Int!
    delay: Int
    error: Boolean
    position: Int!
    text: String!
    }

    input ModifyElementInput {
    delay: Int
    error: Boolean
    text: String!
    }

    type Query {
    list: List
    }

    type Mutation {
    addElement(input: CreateElementInput!): Structure
    modifyElement(id: Int!, input: ModifyElementInput!): Element
    }
`;

module.exports = typeDefs;
