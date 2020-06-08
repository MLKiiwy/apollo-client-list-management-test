import React, { useRef } from 'react';
import Element from '../components/Element';
import { useQuery, gql, useMutation } from '@apollo/client';
import faker from 'faker';

const GET_LIST = gql`
  query getList {
    list {
      id
      structure {
        id
        elements {
          id
          text
          optimisticUi @client
        }
      }
    }
  }
`;

const ADD_ELEMENT = gql`
  mutation AddElement($input: CreateElementInput!) @queue(name: "elements") {
    addElement(input: $input) {
      id
      elements {
        id
        text
        optimisticUi @client
      }
    }
  }
`;

const MODIFY_ELEMENT = gql`
  mutation ModifyElement($id: Int!, $input: ModifyElementInput!) @queue(name: "elements") {
    modifyElement(id: $id, input: $input) {
      id
      text
      optimisticUi @client
    }
  }
`;

export default function List() {
  const delayRef = useRef();
  const errorRef = useRef();
  const positionRef = useRef();

  const { loading, error, data } = useQuery(GET_LIST);

  const [addElement] = useMutation(ADD_ELEMENT);
  const [modifyElement] = useMutation(MODIFY_ELEMENT);

  function addHandler() {
    const text = faker.name.lastName();
    const newElement = {
      id: Math.round(Math.random() * 1000000),
      text,
    };
    const position = parseInt(positionRef.current.value, 10);
    const input = {
      ...newElement,
      delay: parseInt(delayRef.current.value, 10),
      error: errorRef.current.checked,
      position,
    };
    const { structure: { id, elements } } = data.list;
    const newElements = [
      ...elements.slice(0, position),
      { ...newElement, optimisticUi: true, __typename: 'Element' },
      ...elements.slice(position),
    ];
    addElement({
      variables: {
        input,
      },
      optimisticResponse: {
        __typename: 'Mutation',
        addElement: {
          id,
          __typename: 'Structure',
          elements: newElements,
        },
      },
    });
  }

  function handleOnModify(id, text) {
    modifyElement({
      variables: {
        id,
        input: {
          text,
          delay: parseInt(delayRef.current.value, 10),
          error: errorRef.current.checked,
        },
      },
      optimisticResponse: {
        __typename: 'Mutation',
        modifyElement: {
          id,
          __typename: 'Element',
          text,
          optimisticUi: true,
        },
      },
    });
  }

  function generateOptions() {
    const length = data ? data.list.structure.elements.length : 0;
    // eslint-disable-next-line
    return Array.apply(null, Array(length + 1)).map((e, index) => <option key={`option-${index}`} value={index}>{index + 1}</option>);
  }

  return (
    <>
      <fieldset>
        <legend>Global params</legend>
        <label>
          Error:
          <input type="checkbox" ref={errorRef} />
        </label>
        <label>
          Delay in seconds:
          <input type="text" ref={delayRef} defaultValue="2" />
        </label>
      </fieldset>
      <fieldset>
        <legend>New element</legend>
        <label>
          Position:
          <select ref={positionRef}>{generateOptions()}</select>
        </label>
        &nbsp;
        <button type="button" onClick={addHandler}>Add</button>
      </fieldset>
      <br />
      <br />
      {loading && <span>Loading ...</span>}
      {error && <span>Error ...</span>}
      <ul>
        {data
          && data.list
          && data.list.structure.elements.map(e => <Element key={`element-${e.id}`} element={e} onModify={handleOnModify} />)}
      </ul>
    </>
  );
}
