const keyCount = {};
export const isBeingCalledExcessively = ({ uniqName }) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  if (!uniqName) {
    throw new Error("uniqName is required");
  }
  // if this function is hit more than 10 times in a row in 2 seconds with the same uniqName then throw an error
  if (keyCount[uniqName + "_timeout"]) {
    clearTimeout(keyCount[uniqName + "_timeout"]);
  }
  keyCount[uniqName] = keyCount[uniqName] || 0;
  keyCount[uniqName]++;

  keyCount[uniqName + "_timeout"] = setTimeout(() => {
    keyCount[uniqName] = 0;
  }, 2000);

  if (keyCount[uniqName] > 20) {
    keyCount[uniqName] = 0;
    throw new Error(`isBeingCalledExcessively: ${uniqName}`);
  }
};
