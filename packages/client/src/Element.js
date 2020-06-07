import React from "react";
import cn from "classnames";

export default function Element({ element: { id, text, optimisticUi } , onModify}) {
  const classes = cn('element', {
    'element--optimistic-ui': optimisticUi,
  });

  function handleKeyUp(event) {
    if (event.keyCode !== 13) {
      return;
    }

    onModify(id, event.target.value);
  }

  return (
    <li key={`key-${id}`} className={classes}>
      {text} &nbsp; &nbsp; &nbsp; &nbsp;
      <input type="text" defaultValue={text} onKeyUp={handleKeyUp} />
    </li>
  );
}
