export default function splitStringIntoLines(string) {
	let lines = [];
	if (string === "") {
		return lines;
	}
	else {
		lines = string.split(/\r?\n/);
		if (lines.length == 1) { //tnr: not sure why this check is being made... but keeping it in because it is probably doing something
			lines = string.split('\\n');
		}
		return lines;
	}
};