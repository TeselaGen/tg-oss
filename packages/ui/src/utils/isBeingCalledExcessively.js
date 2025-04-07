const keyCount = {};
// if this function is hit more than 20 times in a row in 2 seconds with the same uniqName then throw an error
export const isBeingCalledExcessively = ({ uniqName }) => {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  if (!uniqName) {
    throw new Error("uniqName is required");
  }
  // Initialize the count if it doesn't exist
  keyCount[uniqName] = keyCount[uniqName] || 0;
  keyCount[uniqName]++;

  // Only set the timeout if it doesn't exist already to ensure it runs exactly once every 2 seconds
  if (!keyCount[uniqName + "_timeout"]) {
    keyCount[uniqName + "_timeout"] = setTimeout(() => {
      keyCount[uniqName] = 0;
      keyCount[uniqName + "_timeout"] = null;
    }, 2000);
  }

  if (keyCount[uniqName] > 20) {
    keyCount[uniqName] = 0;
    // Also clear the timeout when throwing an error
    if (keyCount[uniqName + "_timeout"]) {
      clearTimeout(keyCount[uniqName + "_timeout"]);
      keyCount[uniqName + "_timeout"] = null;
    }
    throw new Error(`isBeingCalledExcessively: ${uniqName}`);
  }
};
