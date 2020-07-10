import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Mesh,
	MeshBasicMaterial,
	Plane,
	Shape,
	ShapeBufferGeometry,
	Texture,
} from 'three';
import { parseSvgPath } from '../utils/svg';
import { PathDefinition } from '../types/schema';
import { moveUVTo } from '../utils/bufferAttribute';
import { useDoubleClick } from '../utils/doubleClickHook';
import { useDispatch } from 'react-redux';
import { selectPath } from '../logic/slices/editorSlice';

interface PathPropsInterface {
	d: PathDefinition;
	active: string | null;
	id: string;
	background: null | Texture;
	backgroundWidth: number;
	viewBox: Plane[];
}

export const Path: React.FC<PathPropsInterface> = React.memo(
	({ d, id, background, backgroundWidth, viewBox }) => {
		const mesh = useRef<Mesh>();
		const geometry = useRef<ShapeBufferGeometry>();
		const material = useRef<MeshBasicMaterial>();
		const dispatch = useDispatch();
		const dblClickHandler = useDoubleClick(() => dispatch(selectPath(id)));

		// traduco dalle definizioni (ristrette) del path svg una Shape threejs
		const shape = useMemo<Shape>(() => {
			return parseSvgPath(d);
		}, [d]);
		const shapeCenter = useMemo<{ x: number; y: number }>(() => {
			if (!geometry.current) {
				return { x: 0, y: 0 };
			}
			geometry.current.computeBoundingBox();
			const { boundingBox } = geometry.current;
			// anche qui non so bene perche' sia necessario. Probabilmente typescript non capisce che ho chiamato il calcolo
			// poco prima nella funzione
			if (!boundingBox) {
				return { x: 0, y: 0 };
			}

			return {
				x: (boundingBox.max.x + boundingBox.min.x) / 2,
				y: (boundingBox.max.y + boundingBox.min.y) / 2,
			};
		}, [shape, geometry.current]);

		const [hovered, setHover] = useState(false);

		// quando viene caricato il background aggiorno il materiale
		useEffect(() => {
			if (background && material.current) {
				material.current.needsUpdate = true;

				// l'if sottostante e' fasullo, serve solo a far stare tranqillo typescript: in questo punto
				// geometry.current e' sempre valorizzato correttamente
				if (geometry.current && shapeCenter) {
					const x = shapeCenter.x - backgroundWidth / 2;
					const y = shapeCenter.y - backgroundWidth / 2;
					// @ts-ignore
					moveUVTo(
						x,
						y,
						// @ts-ignore
						geometry.current.attributes.uv.array,
					);
					// @ts-ignore
					geometry.current.attributes.uv.needsUpdate = true;
				}
			}
		}, [background]);

		return (
			<>
				<mesh
					position={[0, 0, 1]}
					ref={mesh}
					onPointerOver={() => setHover(true)}
					onPointerOut={() => setHover(false)}
					layers={[0]}
					onClick={dblClickHandler}
					// onClick={() => {
					// @ts-ignore
					// rotateUVonPlanarBufferGeometry2(1, geometry.current?.attributes.uv as any, background?.matrix);
					// invalidate();
					// }}
				>
					<meshBasicMaterial
						attach="material"
						map={background}
						opacity={hovered ? 0.7 : 1}
						ref={material}
						clippingPlanes={viewBox}
					/>
					<shapeBufferGeometry ref={geometry} attach="geometry" args={[shape]} />
				</mesh>
			</>
		);
	},
);

// @ts-ignore
Path.whyDidYouRender = true;
