import { isOdd } from './misc';
import {
	MathUtils,
	Matrix3,
} from 'three';

export const moveUVTo = (x: number, y: number, uvs: Float32Array): void => {
	let i;
	for (i = 0; i < uvs.length; i++) {
		uvs[i] -= isOdd(i) ? y : x;
	}
};


const applyMatrix3 = (x: number, y: number, m: Matrix3): { x: number; y: number } => {
	const e = m.elements;

	return { x: e[0] * x + e[3] * y + e[6], y: e[1] * x + e[4] * y + e[7] };
};

export function updateUVsFromAssociation(
	x: number,
	y: number,
	cx: number,
	cy: number,
	rotateInDeg: number,
	uvs: Float32Array | undefined,
	textureBaseMatrix: Matrix3 | undefined,
) {
	if (!uvs || !textureBaseMatrix) {
		return;
	}
	const rad = MathUtils.degToRad(rotateInDeg);
	const matrix = textureBaseMatrix.clone();
	matrix.setUvTransform(-x, -y, 1, 1, rad, cx, cy);

	let i, tmp;
	for (i = 0; i < uvs.length; i += 2) {
		tmp = applyMatrix3(uvs[i], uvs[i + 1], matrix);
		// @ts-ignore
		uvs[i] = tmp.x;
		// @ts-ignore
		uvs[i + 1] = tmp.y;
	}
}
