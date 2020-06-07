import React, { useRef } from "react";
import Element from "./Element";
import { useQuery, gql, useMutation } from "@apollo/client";
import faker from 'faker';

const GET_FORM = gql`
  query getForm {
    form {
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

const ADD_FORM_ELEMENT = gql`
  mutation AddFormElement($input: CreateFormElementInput!) {
    addFormElement(input: $input) {
      id
      elements {
        id
        text
        optimisticUi @client
      }
    }
  }
`;

const MODIFY_FORM_ELEMENT = gql`
  mutation ModifyFormElement($id: Int!, $input: ModifyFormElementInput!) {
    modifyFormElement(id: $id, input: $input) {
      id
      text
      optimisticUi @client
    }
  }
`;

export default function Form() {
  const delayRef = useRef();
  const errorRef = useRef();
  const positionRef = useRef();

  const { loading, error, data } = useQuery(GET_FORM);

  const [addFormElement] = useMutation(ADD_FORM_ELEMENT, {
    // update: (cache, result) => {
    //   console.log(result);
    //   const { data: { addFormElement } } = result;
    //   const data = cache.readQuery({ query: GET_FORM });
    //   cache.writeQuery({ query: GET_FORM, data: {
    //     form: {
    //       ...data.form,
    //       structure: addFormElement
    //     }
    //   }});
    // }
    // refetchQueries: [{ query: GET_FORM }]
  });
  const [modifyFormElement] = useMutation(MODIFY_FORM_ELEMENT);

  function addHandler() {
    const text = faker.name.lastName();
    const newElement = {
      id: Math.round(Math.random() * 1000000),
      text,
    };
    const position = parseInt(positionRef.current.value, 10);
    const input = {
      ...newElement,
      delay: parseInt(delayRef.current.value),
      error: errorRef.current.checked,
      position,
    };
    const { structure: { id, elements } } = data.form;
    const newElements = [
      ...elements.slice(0, position),
      { ...newElement, optimisticUi: true , __typename: 'FormElement' },
      ...elements.slice(position)
    ];
    addFormElement({
      variables: {
        input,
      },
      optimisticResponse: {
        __typename: "Mutation",
        addFormElement: {
          id,
          __typename: 'FormStructure',
          elements: newElements
        }
      }
    });
  }

  function handleOnModify(id, text) {
    modifyFormElement({
      variables: {
        id,
        input: {
          text,
          delay: parseInt(delayRef.current.value),
          error: errorRef.current.checked,
        }
      },
      optimisticResponse: {
        __typename: "Mutation",
        modifyFormElement: {
          id,
          __typename: 'FormElement',
          text,
          optimisticUi: true,
        }
      }
    });
  }

  function generateOptions() {
    const length = data ? data.form.structure.elements.length : 0;
    return Array.apply(null, Array(length + 1)).map((e, index) => <option key={`option-${index}`} value={index} >{index + 1}</option>);
  }

  return (
    <>
      <fieldset>
        <legend>Global params</legend>
        <label>Error: <input type="checkbox" ref={errorRef} /></label>
        <label>Delay in seconds: <input type="text" ref={delayRef} defaultValue="2" /></label>
      </fieldset>
      <fieldset>
        <legend>New element</legend>
        <label>Position: <select ref={positionRef} >{generateOptions()}</select></label>
        &nbsp;
        <button onClick={addHandler}>Add</button>
      </fieldset>
      <br />
      <br />
      {loading && <span>Loading ...</span>}
      {error && <span>Error ...</span>}
      <ul>
        {data &&
          data.form &&
          data.form.structure.elements.map(e => <Element key={`element-${e.id}`} element={e} onModify={handleOnModify} />)}
      </ul>
    </>
  );
}
