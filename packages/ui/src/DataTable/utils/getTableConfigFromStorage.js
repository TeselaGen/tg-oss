export default function getTableConfigFromStorage(formName) {
  let tableConfig = window.localStorage.getItem(formName);
  tableConfig = tableConfig && JSON.parse(tableConfig);
  return tableConfig;
}
