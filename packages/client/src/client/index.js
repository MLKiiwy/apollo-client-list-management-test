import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import QueueLink from './QueueLink';

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

export default client;
