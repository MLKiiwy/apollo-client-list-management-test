import { ApolloLink } from '@apollo/client';
import { checkDocument, removeDirectivesFromDocument, hasDirectives, getOperationDefinition } from '@apollo/client/utilities';
import { Observable } from 'zen-observable-ts';

const DIRECTIVE_NAME = 'queue';

function getDirectiveOptions(directiveName, { directives }) {
    if (!directives) {
        return {};
    }
    const directive =  directives.find(({name}) => name.value === directiveName);
    const args = directive ? directive.arguments.map( ({ name, value }) => ({ [name.value]: value.value}) ) : [];
    return args.reduce((map, arg) => ({ ...map, ...arg}), {})
}

class QueueLink extends ApolloLink {
  constructor() {
    super();
    this.processedDocuments = new Map();
    this.queues = {};
  }

  removeDirectiveFromDocument(query) {
    const cached = this.processedDocuments.get(query);
    if (cached) return cached;

    checkDocument(query);

    const docClone = removeDirectivesFromDocument([{name: DIRECTIVE_NAME, remove: true}], query);

    this.processedDocuments.set(query, docClone);

    return docClone;
  }

  request(operation, forward) {
    const { query } = operation;
    const isQueuedQuery = hasDirectives([DIRECTIVE_NAME], query);

    if (!isQueuedQuery) {
        return forward(operation);
    }

    const cleanedQuery = this.removeDirectiveFromDocument(query);
    operation.query = cleanedQuery;
    const { name } = getDirectiveOptions(DIRECTIVE_NAME, getOperationDefinition(query));

    if (!this.queues[name]) {
        console.log('create new queue ', name);
        this.queues[name] = {
            running: null,
            waiting: [],
        };
    }

    return new Observable(observer => {
        const operationEntry = this.enqueueOperation(name, { operation, forward, observer });
        return () => {
            this.unsubscribe(operationEntry, name, observer);
        };
    });
  }

  enqueueOperation(queueName, { operation, forward, observer }) {
    const currentQueue = this.queues[queueName];

    console.log('Add operation to the queue ', operation.operationName, operation.variables.input.text);
    currentQueue.waiting.push({ operation, forward, observer });

    this.runNextOperation(queueName);

    return { operation, forward, observer };
  }

  runNextOperation(queueName) {
    const currentQueue = this.queues[queueName];

    if (currentQueue.running) {
        console.log('An operation is running on ', queueName, ' for now we do nothing');
        return;
    }

    if (currentQueue.waiting.length === 0) {
        console.log('No new operation to start on queue ', queueName);
        return;
    }

    const { operation, forward, observer } = currentQueue.waiting.pop();

    console.log('Start operation ', operation.operationName, operation.variables.input.text);

    currentQueue.running = forward(operation).subscribe({
        next: (result) => {
            console.log('Operation next', operation.operationName, operation.variables.input.text);
            observer.next && observer.next(result);
        },
        error: (error) => {
            console.log('Operation error', operation.operationName, operation.variables.input.text);
            observer.error && observer.error(error);
        },
        complete: (result) => {
            console.log('Operation complete', operation.operationName, operation.variables.input.text);
            currentQueue.running = null;
            observer.complete && observer.complete(result);
            this.runNextOperation(queueName);
        }
    });

    return currentQueue.running;
  }

  unsubscribe(operationEntry, queueName, observer) {
    const { operation } = operationEntry;

    console.log('On queue ', queueName, ' unsubscribe', operation.operationName, operation.variables.input.text);
  }
}

export default QueueLink;