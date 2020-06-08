import React from 'react';
import { ApolloProvider } from '@apollo/client';
import './styles.css';
import List from './containers/List';
import client from './client';

export default function App() {
  return (
    <ApolloProvider client={client}>
      <div className='App'>
        <h1>List management playground</h1>
        <List />
      </div>
    </ApolloProvider>
  );
}
