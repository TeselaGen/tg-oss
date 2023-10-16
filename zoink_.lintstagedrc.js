module.exports = {
  "**/*.{js,ts,jsx,tsx}": filenames => {
    console.log(`filenames:`, filenames);
    return filenames.length > 10
      ? "eslint --fix ."
      : `eslint --fix ${filenames.join(
          " "
        )} && pretter --write -u ${filenames.join(" ")}`;
  },
  "!**/*.{js,ts,jsx,tsx}": "prettier --write -u"
};
