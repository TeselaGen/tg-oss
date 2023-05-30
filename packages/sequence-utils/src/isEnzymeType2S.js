export default function isEnzymeType2S(e) {
  return e.site.length < e.topSnipOffset || e.site.length < e.bottomSnipOffset;
};
