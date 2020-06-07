const form = require('./data');
const Promise = require('bluebird');

const resolvers = {
    Query: {
      form: () => form
    },
    Mutation: {
      addFormElement: async (parent, { input: { id, delay, error, text, position } }) => {
        if( delay > 0) {
         await Promise.delay(delay * 1000);
        }

        if (error) {
          throw new Error('an error');
        }

        // Mutate the data in the memory
        form.structure.elements.splice(position, 0, {
          id,
          text
        });

        return form.structure;
      },
      modifyFormElement: async (parent, { id, input: { delay, error, text }}) => {
        if( delay > 0) {
          await Promise.delay(delay * 1000);
         }

         if (error) {
           throw new Error('an error');
         }

        const element = form.structure.elements.find((element) => element.id == id);

        if (!element) {
          throw new Error('not found');
        }

        element.text = text;

         return element;
      }
    }
  };

module.exports = resolvers;
