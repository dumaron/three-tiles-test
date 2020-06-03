import { isOdd } from './misc';
// import { Vector2 } from 'three';

export const moveUVTo = (x: number, y: number, uvs: Float32Array): void => {
	let i;
	for (i = 0; i < uvs.length; i++) {
		uvs[i] -= isOdd(i) ? y : x;
	}
};
/*

export const vec2ToPosition = (points: ReadonlyArray<Vector2>): Float32Array => {
	const finalArrayLength = (points.length - 1) * 3;
	const arr = new Float32Array(finalArrayLength);
	let i, ti, point;

	for (i = 0; i < points.length; i++) {
		point = points[i];
		ti = i * 3;
		arr[ti] = point.x;
		arr[ti + 1] = point.y;
		arr[ti + 2] = 0;
	}

	return arr;
};
*/
