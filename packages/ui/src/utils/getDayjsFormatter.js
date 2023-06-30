import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(localeData);
dayjs.extend(LocalizedFormat);
const userLocale = Intl.DateTimeFormat().resolvedOptions().locale;

if (userLocale) {
  const requireLocale = (newLocale, skipCall) => {
    if (dayjs.locale() !== newLocale) {
      try {
        require(`dayjs/locale/${newLocale}.js`);
        dayjs.locale(newLocale);
      } catch (error) {
        // error
        if (!skipCall && newLocale.includes("-")) {
          requireLocale(newLocale.split("-")[0], true);
        }
      }
    }
  };
  const localeToUse = userLocale.toLowerCase();
  requireLocale(localeToUse);
}

export default function getDayjsFormatter(format) {
  return {
    formatDate: date => dayjs(date).format(format),
    parseDate: str => dayjs(str, format).toDate(),
    placeholder: format?.toLowerCase().includes("l")
      ? dayjs.Ls[dayjs.locale()]?.formats[format.toUpperCase()]
      : format
  };
}
