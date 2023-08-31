import { invert } from "lodash";
import aminoAcidToDegenerateDnaMap from "./aminoAcidToDegenerateDnaMap";

const degenerateDnaToAminoAcidMap = invert(aminoAcidToDegenerateDnaMap);
export default degenerateDnaToAminoAcidMap;
