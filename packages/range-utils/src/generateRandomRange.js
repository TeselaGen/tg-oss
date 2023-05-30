import normalizePositionByRangeLength from './normalizePositionByRangeLength';

export default function generateRandomRange(minStart, maxEnd, maxLength) {
	const start = getRandomInt(minStart, maxEnd); 
	let end;
	if (maxLength) {
		end = normalizePositionByRangeLength(getRandomInt(start, start + maxLength), maxEnd)
	} else {
		end = getRandomInt(minStart, maxEnd); 
	}
	return {
		start: start,
		end: end,
	}
};


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
