//tnr: taken from https://github.com/angus-c/waldojs (not using waldojs as it is not being maintained and pulled in nasty babel runtime transforms)
/* eslint-disable eqeqeq */
import { isEqual } from "lodash";

class Match {
  constructor(props) {
    Object.assign(this, props);
    this.value = this.obj[this.prop];
  }

  toString() {
    const { path, type } = this;
    return `${path} -> (${type}) ${this.logValue()}`;
  }

  logValue() {
    const val = this.value;
    // if value is an object then just toString it
    const isPrimitive = x => Object(x) !== x;
    return isPrimitive(val) || Array.isArray(val) ? val : {}.toString.call(val);
  }

  log() {
    console.info(this.toString());
  }
}

const GLOBAL = typeof window == "object" ? window : global;

export default function searchWholeObjByName(what, where) {
  const searchBy = (what, where, prop) => what == prop;

  let data;
  let alreadySeen;

  const path = where == GLOBAL ? "GLOBAL" : "SRC";
  const queue = [{ where, path }];
  const seen = [];

  const matches = [];
  matches.log = function () {
    this.forEach(m => m.log());
  };

  // a non-recursive solution to avoid call stack limits
  // http://www.jslab.dk/articles/non.recursive.preorder.traversal.part4
  while ((data = queue.pop())) {
    const { where, path } = data;

    for (const prop in where) {
      // IE may throw errors when accessing/coercing some properties
      try {
        // eslint-disable-next-line no-prototype-builtins
        if (where.hasOwnProperty(prop)) {
          // inspect objects
          if ([where[prop]] == "[object Object]") {
            // check if already searched (prevents circular references)
            for (
              let i = -1;
              seen[++i] &&
              !(alreadySeen = isEqual(seen[i].where, where[prop]) && seen[i]);

            );
            // add to stack
            if (!alreadySeen) {
              data = { where: where[prop], path: `${path}.${prop}` };
              queue.push(data);
              seen.push(data);
            }
          }
          // if match detected, push it.
          if (searchBy(what, where, prop)) {
            const type = alreadySeen
              ? `<${alreadySeen.path}>`
              : typeof where[prop];
            const match = new Match({
              path: `${path}.${prop}`,
              obj: where,
              prop,
              type
            });
            matches.push(match);
          }
        }
      } catch (e) {
        // don't throw errs
      }
    }
  }

  return matches;
}
export function searchWholeObjByNameSimple(what, where) {
  return searchWholeObjByName(what, where)?.[0]?.value?.[0];
}
export function searchWholeObjByNameSimpleArray(what, where) {
  return searchWholeObjByName(what, where)?.[0]?.value;
}
