import React from "react";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  gql,
} from "@apollo/client";
import "./styles.css";
import Form from "./Form";

const typeDefs = gql`
  extend type FormElement {
    optimisticUi: Boolean!
  }
`;

const resolvers = {
  FormElement: {
    optimisticUi: () => false
  }
};

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000',
  }),
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
