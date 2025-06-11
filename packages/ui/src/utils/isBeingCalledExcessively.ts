const keyCount: { [key: string]: number | null } = {};
const timeout: { [key: string]: NodeJS.Timeout | null } = {};

// if this function is hit more than 20 times in a row in 2 seconds with the same uniqName then throw an error
export const isBeingCalledExcessively = ({
  uniqName
}: {
  uniqName: string;
}) => {
  if (process.env["NODE_ENV"] !== "development") {
    return;
  }
  if (!uniqName) {
    throw new Error("uniqName is required");
  }
  // Initialize the count if it doesn't exist
  keyCount[uniqName] = keyCount[uniqName] || 0;
  (keyCount[uniqName] as number)++;

  // Only set the timeout if it doesn't exist already to ensure it runs exactly once every 2 seconds
  if (!timeout[uniqName]) {
    timeout[uniqName] = setTimeout(() => {
      keyCount[uniqName] = 0;
      timeout[uniqName] = null;
    }, 2000);
  }

  if ((keyCount[uniqName] as number) > 20) {
    keyCount[uniqName] = 0;
    // Also clear the timeout when throwing an error
    if (timeout[uniqName]) {
      clearTimeout(timeout[uniqName]);
      timeout[uniqName] = null;
    }
    throw new Error(`isBeingCalledExcessively: ${uniqName}`);
  }
};
