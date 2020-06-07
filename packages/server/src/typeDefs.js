const { gql } = require('apollo-server');

const typeDefs = gql`
    type FormElement {
    id: Int!
    text: String!
    }

    type FormStructure {
    id: String!
    elements: [FormElement!]
    }

    type Form {
    id: String!
    structure: FormStructure!
    }

    input CreateFormElementInput {
    id: Int!
    delay: Int
    error: Boolean
    position: Int!
    text: String!
    }

    input ModifyFormElementInput {
    delay: Int
    error: Boolean
    text: String!
    }

    type Query {
    form: Form
    }

    type Mutation {
    addFormElement(input: CreateFormElementInput!): FormStructure
    modifyFormElement(id: Int!, input: ModifyFormElementInput!): FormElement
    }
`;

module.exports = typeDefs;