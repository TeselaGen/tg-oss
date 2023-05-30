export function unmangleUrls(str) {
  if (!str) return str;
  if (typeof str !== "string") return str;

  const urlRegex = /%%TG%%_(.*?)_%%TG%%/g;
  return str.replace(urlRegex, function (outer, innerUrl) {
    if (innerUrl) {
      return `${decodeURIComponent(innerUrl)}`;
    }
    return outer;
  });
}

export function mangleOrStripUrls(
  str,
  { mangleUrls, doNotMangleOrStripUrls } = {}
) {
  if (!str) return str;
  const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
  if (mangleUrls || doNotMangleOrStripUrls) {
    if (doNotMangleOrStripUrls) {
      //if doNotMangleOrStripUrls=true, just return the original string
      return str;
    }
    //if mangleUrls=true, return a URL mangled and encoded string
    return str.replace(urlRegex, function (url) {
      return `%%TG%%_${encodeURIComponent(url)}_%%TG%%`;
    });
  }
  //if no options passed, strip all URLs from the string
  return str.replace(urlRegex, function () {
    return ``;
  });
}
