import { cloneDeep, forEach } from "lodash";

export default function cleanUpTeselagenJsonForExport(tgJson) {
	const seqData = cloneDeep(tgJson);
	if (!seqData) return seqData
	delete seqData.cutsites;
	delete seqData.orfs;
	forEach(seqData.translations,(t)=>{
		delete t.aminoAcids
	})
	return seqData
}

