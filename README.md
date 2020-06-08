# apollo-client-list-management-test

A playground project to test how managing a "list" object with apollo client.

With this project you can simulate **delays** and **errors** server side, and see the impact on the UI/state client side.

## The "add" element scenario in case of "delay"

One of the most common scenario and one of the most difficult one to handle properly client side.
How to build a fast and reliable UI when request are a bit too slow?

Apollo provides already lot of tooling and tutorials around this question, see:

- https://www.apollographql.com/blog/tutorial-graphql-mutations-optimistic-ui-and-store-updates-f7b6b66bf0e2
- https://www.apollographql.com/docs/react/v3.0-beta/performance/optimistic-ui/#adding-to-a-list

### Server response is important

ApolloClient relies on the **response** (optimistic or real) of the mutation to update the UI.
If you want to update your state (=apollo cache), you need to have a response.

#### Not working: client side state is not updated

For example if you write an **add** request like this:

```gql
mutation AddElement($input: CreateElementInput!) {
  addElement(input: $input) {
    id
  }
}
```

Your client **can't** know the element **values** AND the element **position**, so the state + UI will not reflect it.
If you want to perform request like this, you have to update the cache manually with cache.write ... but honestly there is in this case no advantage to do that.

#### Solution 1: Simply refetch the list after the request

The simple one ...

```js
useMutation(ADD_ELEMENT, {
  refetchQueries: [{ query: GET_LIST }],
});
```

Pro:

- works

Cons:

- slow because require 2 network queries

#### Solution 2: update handler

If you add element values to the response, apollo state will have the correct value for the entire element:

```gql
mutation AddElement($input: CreateElementInput!) {
  addElement(input: $input) {
    id
    text
  }
}
```

But you are still missing the **position** of the element here ...

That's why in the tutorial they use the **update** property on the mutate function
=> because the position is shared between two object (list / element), and you have to update the list with the element.

Pro:

- works
- only 1 query

Cons:

- you need to know the query you use to display the list ...
- maintenance
- lot of code
- still a time to wait before seen the list updated (time of the query)

```js
mutate({
    variables: { ... },
    update: (proxy, { data: { addElement: newElement } }) => {
        const data = proxy.readQuery({ query: GET_LIST });
        proxy.writeQuery({ query: GET_LIST, data: {
            ...data,
            elements: [...data.elements, newElement]
        }});
    }
})
```

#### Solution 3: update handler + optimisic response

If you give to the mutation an optimisic response, this response will be applied **immediately** before the request is even execute.
As a result, you don't have to wait the response of the request to refresh the UI.

```js
mutate({
    variables: { ... },
    update: (proxy, { data: { addElement: newElement } }) => {
        const data = proxy.readQuery({ query: GET_LIST });
        proxy.writeQuery({ query: GET_LIST, data: {
            ...data,
            elements: [...data.elements, newElement]
        }});
    },
    optimisticResponse: {
        __typename: "Mutation",
        addElement: {
            id,
            __typename: 'Element',
            text,
        }
    }
})
```

Pro:

- works
- only 1 query
- no waiting time anymore

Cons:

- you need to know the query you use to display the list ...
- maintenance
- lot of code

#### Solution 4: change response shape for Element -> List

Instead of returning the new Element, let's return the modified List:

```gql
mutation AddElement($input: CreateElementInput!) {
  addElement(input: $input) {
    id
    elements {
      id
      text
    }
  }
}
```

This solution **works**, if you don't forget to return also the id of the list.

Apollo will read the response query:

- see the List object
- find same object in the cache with key "List-id-value"
- update the cache

You don't have to manually update the cache with an **update** handler, so you can remove it.
You need also to adapt the optimisicResponse to be also the updated list.

Pro:

- works
- not specific code client side, apollo does eveything for you
- no waiting time
- few lines of code

Cons:

- increase load on the server side (request need to return the list and not the element)

#### Solution 5: change response shape and add position field to Element

Instead of returning the list, let's go back to Element but add the position as a field:

```gql
mutation AddElement($input: CreateElementInput!) {
  addElement(input: $input) {
    id
    text
    position
  }
}
```

This solution **works**, if you manually order the element list on the client side.
That mean **list.elements** array is now consider as an **unordered** array.

Pro:

- works
- no waiting time
- few lines of code

Cons:

- still require an update handler
- you need to know the query you use to display the list ...
