import { isOdd } from './misc';
import {
	MathUtils,
	BufferGeometry,
	Geometry,
	Matrix4,
	Mesh,
	BufferAttribute,
	Matrix3,
} from 'three';
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

export function rotateUVonPlanarBufferGeometry(
	rotateInDeg: number,
	mesh: Mesh | undefined,
) {
	if (rotateInDeg !== undefined && mesh) {
		var degreeInRad = MathUtils.degToRad(rotateInDeg);
		var tempGeo = mesh.geometry.clone();
		var geo;

		if (tempGeo instanceof BufferGeometry) {
			geo = new Geometry().fromBufferGeometry(tempGeo);
		} else {
			console.log(
				'regular geometry currently not supported in this method, but can be if code is modified, so use a buffer geometry',
			);
			return;
		}

		// rotate the geo on Z-axis
		// which will rotate the vertices accordingly
		geo.applyMatrix4(new Matrix4().makeRotationZ(degreeInRad));

		// loop through the vertices which should now have been rotated
		// change the values of UVs based on the new rotated vertices
		var index = 0;
		geo.vertices.forEach(function (v) {
			// @ts-ignore
			mesh.geometry.attributes.uv.setXY(index, v.x, v.y);
			index++;
		});

		// @ts-ignore
		mesh.geometry.attributes.uv.needsUpdate = true;
	}
}

const applyMatrix3 = (x: number, y: number, m: Matrix3): { x: number; y: number } => {
	const e = m.elements;

	return { x: e[0] * x + e[3] * y + e[6], y: e[1] * x + e[4] * y + e[7] };
};

export function rotateUVonPlanarBufferGeometry2(
	rotateInDeg: number,
	uvs: BufferAttribute | undefined,
	textureBaseMatrix: Matrix3 | null,
) {
	if (!uvs || !textureBaseMatrix) {
		return;
	}
	const degreeInRad = MathUtils.degToRad(rotateInDeg);
	const matrix = textureBaseMatrix.clone();
	matrix.setUvTransform(0, 0, 1, 1, degreeInRad, 0, 0)
	
	let i, tmp;
	for (i=0; i<uvs.array.length; i+= 2) {
		tmp = applyMatrix3(uvs.array[i], uvs.array[i+1], matrix);
		// @ts-ignore
		uvs.array[i] = tmp.x;
		// @ts-ignore
		uvs.array[i + 1] = tmp.y;
	}
	

	uvs.needsUpdate = true;
}
