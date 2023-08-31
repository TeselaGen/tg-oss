import { invert } from "lodash";
import aminoAcidToDegenerateRnaMap from "./aminoAcidToDegenerateRnaMap";

const degenerateRnaToAminoAcidMap = invert(aminoAcidToDegenerateRnaMap);
export default degenerateRnaToAminoAcidMap;
