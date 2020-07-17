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
import { moveUVTo, updateUVsFromAssociation } from '../utils/bufferAttribute';
import { useDoubleClick } from '../utils/doubleClickHook';
import { useDispatch, useSelector } from 'react-redux';
import { selectPath } from '../logic/slices/editorSlice';
import { RootState } from '../logic/rootReducer';

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
		const centerUVCoords = useRef<Float32Array | null>(null);
		const dispatch = useDispatch();
		const imageAssociation = useSelector(
			(state: RootState) => state.loadedScheme.associations[id],
		);
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
					let x = shapeCenter.x - backgroundWidth / 2;
					let y = shapeCenter.y - backgroundWidth / 2;

					// metto da parte le coordinate uv spostate al centro, mi servira' per i futuri spostamenti
					// @ts-ignore
					const clone = geometry.current.attributes.uv.array.slice();
					moveUVTo(x, y, clone);
					centerUVCoords.current = clone;

					if (imageAssociation) {
						// sono nel caso in cui carico un materiale gia' spostato
						x += imageAssociation.x;
						y += imageAssociation.y;
					}

					updateUVsFromAssociation(
						x,
						y,
						x + 100,
						y + 100,
						imageAssociation.rotation,
						// @ts-ignore
						geometry.current.attributes.uv.array,
						background?.matrix,
					);

					// @ts-ignore
					geometry.current.attributes.uv.needsUpdate = true;
				}
			}
		}, [background]);

		useEffect(() => {
			if (centerUVCoords.current === null) {
				// sono nel caso in cui non ho ancora inizializzato niente, sto fermo
			} else {
				const { x, y, rotation } = imageAssociation;
				if (geometry.current) {
					const uvs = centerUVCoords.current.slice();
					updateUVsFromAssociation(
						x,
						y,
						x + 100,
						y + 100,
						rotation,
						uvs,
						background?.matrix,
					);
					// @ts-ignore
					geometry.current.attributes.uv.array = uvs;
					// @ts-ignore
					geometry.current.attributes.uv.needsUpdate = true;
				}
			}
		}, [imageAssociation]);

		return (
			<>
				<mesh
					position={[0, 0, 1]}
					ref={mesh}
					onPointerOver={() => setHover(true)}
					onPointerOut={() => setHover(false)}
					layers={[0]}
					onClick={dblClickHandler}
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
