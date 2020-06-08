const list = require('./data');
const Promise = require('bluebird');

const resolvers = {
  Query: {
    list: () => list,
  },
  Mutation: {
    addElement: async (parent, { input: { id, delay, error, text, position } }) => {
      if (delay > 0) {
        await Promise.delay(delay * 1000);
      }

      if (error) {
        throw new Error('an error');
      }

      // Mutate the data in the memory
      list.structure.elements.splice(position, 0, {
        id,
        text,
      });

      return list.structure;
    },
    modifyElement: async (parent, { id, input: { delay, error, text } }) => {
      if (delay > 0) {
        await Promise.delay(delay * 1000);
      }

      if (error) {
        throw new Error('an error');
      }

      const element = list.structure.elements.find(element => element.id === id);

      if (!element) {
        throw new Error('not found');
      }

      element.text = text;

      return element;
    },
  },
};

module.exports = resolvers;
