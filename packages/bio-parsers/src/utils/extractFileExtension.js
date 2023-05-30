export default function extractFileExtension(name) {
	if (typeof name === 'string') {
		let ext = "";
		const match = name.match(/\.(\w+)$/);
		if (match && match[1]) {
			ext = match[1];
		}
		return ext;
	}
	else {
		return "";
	}
};

