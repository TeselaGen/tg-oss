import { invert } from "lodash-es";
import aminoAcidToDegenerateDnaMap from "./aminoAcidToDegenerateDnaMap";

const degenerateDnaToAminoAcidMap = invert(aminoAcidToDegenerateDnaMap);
export default degenerateDnaToAminoAcidMap;
