//helper function to make sure any arrays coming in

import { nanoid } from "nanoid";

//get converted to objects with unique ids
export default function arrayToObjWithIds(array) {
  const newObj = {};
  array.forEach(function (item) {
    const newItem = {
      ...item,
      id: item.id || nanoid()
    };
    newObj[newItem.id] = newItem;
  });

  return newObj;
}
