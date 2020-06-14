import { ShapeBufferGeometry, ShapeGeometry, Vector3 } from 'three';

export const get2dCenter = (
	g: ShapeBufferGeometry | ShapeGeometry,
): { x: number; y: number } => {
	g.computeBoundingBox();
	const v = new Vector3(0, 0, 0);
	g.boundingBox?.getCenter(v);
	return {
		x: v.x,
		y: v.y,
	};
};
