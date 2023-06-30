export function getNewName(list, targetName) {
  const usedNumbers = [];

  for (let i = 0; i < list.length; i++) {
    const currentName = list[i].name;
    const baseName = currentName.replace(/\(\d+\)\.csv$/, ".csv");

    if (baseName === targetName) {
      const match = currentName.match(/\((\d+)\)\.csv$/);
      if (match) {
        usedNumbers[parseInt(match[1])] = true;
      } else {
        usedNumbers[0] = true;
      }
    }
  }

  let newName = targetName;
  for (let i = 0; i <= usedNumbers.length; i++) {
    if (!usedNumbers[i]) {
      if (i === 0) {
        newName = targetName;
      } else {
        newName = targetName.replace(".csv", `(${i}).csv`);
      }
      break;
    }
  }

  return newName;
}
