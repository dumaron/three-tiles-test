import { PathDefinition } from '../types/schema';
import { Shape } from 'three';

export const parseSvgPath = (definition: PathDefinition): Shape => {
	const p = new Shape();
	let lastX: number = 0;
	let lastY: number = 0;

	definition.forEach((block) => {
		const bs = [0, ...(block.slice(1) as number[])].map((n) => n);
		switch (block[0]) {
			case 'M':
				p.moveTo(bs[1], bs[2]);
				lastX = bs[1];
				lastY = bs[2];
				break;
			case 'H':
				p.lineTo(bs[1], lastY);
				lastX = bs[1];
				break;
			case 'V':
				p.lineTo(lastX, bs[1]);
				lastY = bs[1];
				break;
			case 'L':
				p.lineTo(bs[1], bs[2]);
				lastX = bs[1];
				lastY = bs[2];
				break;
			case 'C':
				p.bezierCurveTo(bs[1], bs[2], bs[3], bs[4], bs[5], bs[6]);
				lastX = bs[5];
				lastY = bs[6];
				break;
			default:
				break;
		}
	});

	return p;
};
