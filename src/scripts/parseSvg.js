const fs = require('fs');
const parser = require('svg-parser');
const svgPath = process.argv[2]; // file
// const destinationFile = process.argv[3];
const content = fs.readFileSync(svgPath, 'utf-8');
const parsed = parser.parse(content);
const groups = parsed.children[0].children;

const definitionFormatter = (s) => {
	const tmp = s.split(' ');
	const result = [];
	let tmp2 = [tmp[0]];
	for (let i = 1; i < tmp.length; i++) {
		if (isNaN(Number(tmp[i]))) {
			result.push(tmp2);
			tmp2 = [tmp[i]];
		} else {
			tmp2.push(Number(tmp[i]));
		}
	}
	result.push(['Z']);
	return result;
};

// trovo il gruppo delle piastre
const main = groups.find((g) => g.properties.id === 'piastre') || groups[0];

const paths = main.children.filter((e) => e.tagName === 'path');

const formatted = paths.reduce((result, e) => {
	const { pathid, d } = e.properties;
	result[pathid] = definitionFormatter(d);
	return result;
}, {});

const final = `import { SchemeInterface } from './types/schema';

export const svg: SchemeInterface = {
	paths: ${JSON.stringify(formatted, null, 2)}
};
`;

fs.writeFileSync('src/svg.ts', final, 'utf-8');
