import React from "react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  gql,
} from "@apollo/client";
import "./styles.css";
import Form from "./Form";
import QueueLink from "./QueueLink";

const typeDefs = gql`
  extend type FormElement {
    optimisticUi: Boolean!
  }

  directive @queue(
    name: String!,
  ) on OBJECT | FIELD_DEFINITION
`;

const resolvers = {
  FormElement: {
    optimisticUi: () => false
  }
};

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([
    new QueueLink(),
    new HttpLink({
    uri: 'http://localhost:4000',
  })]),
  connectToDevTools: true,
  typeDefs,
  resolvers,
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Form editor</h1>
        <Form />
      </div>
    </ApolloProvider>
  );
}
