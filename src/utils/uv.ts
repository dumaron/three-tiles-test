import { isOdd } from './misc';

export const moveUVTo = (x: number, y: number, uvs: Float32Array): void => {
	let i;
	for (i = 0; i < uvs.length; i++) {
		uvs[i] -= isOdd(i) ? y : x;
	}
};
