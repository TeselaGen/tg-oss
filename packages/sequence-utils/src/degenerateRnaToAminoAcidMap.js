import { invert } from "lodash-es";
import aminoAcidToDegenerateRnaMap from "./aminoAcidToDegenerateRnaMap";

const degenerateRnaToAminoAcidMap = invert(aminoAcidToDegenerateRnaMap);
export default degenerateRnaToAminoAcidMap;
