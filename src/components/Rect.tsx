import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	Shape,
	Texture,
	Vector2,
	Geometry,
	ShapeBufferGeometry,
	BufferAttribute,
	Layers,
	Mesh,
	MeshBasicMaterial,
} from 'three';
// import { useThree, useUpdate } from 'react-three-fiber';
// import { useGesture } from 'react-use-gesture';
// import { useSpring, animated } from 'react-spring/three';
import { useDoubleClick } from '../utils/doubleClickHook';
import { deselectPath, selectPath } from '../logic/slices/editorSlice';
import { moveImage } from '../logic/slices/loadedSchemeSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import {useThree} from "react-three-fiber";

interface RectPropsInterface {
	x: number;
	y: number;
	active: string | null;
	id: string;
	background: null | Texture;
	backgroundWidth: number;
}

export const Rect: React.FC<RectPropsInterface> = ({
	x,
	y,
	id,
	active,
	background,
	backgroundWidth,
}) => {
	const mesh = useRef<Mesh>();
	const geometry = useRef<ShapeBufferGeometry>();
	const material = useRef<MeshBasicMaterial>();
	const dispatch = useDispatch();
	// const image = useSelector((state: RootState) => state.loadedScheme.images[id]);
	// const { x: offsetX, y: offsetY } = image;
	// const [clipSpring, setClipSpring] = useSpring(() => ({ opacity: 0 }));

	// const [imagePathSpring, setImagePathSpring] = useSpring(() => ({
	// 	position: [0, 0, 1],
	// 	opacity: 0,
	// 	config: { mass: 1, friction: 60, tension: 800 },
	// }));
	// const [pathSpring, setPathSpring] = useSpring(() => ({ opacity: 0 }));
	// const { size, viewport, camera: {zoom} } = useThree();

	const activationCallback = useCallback(() => {
		if (!active) {
			dispatch(selectPath(id));
		}
	}, [active, id]);

	const imagePathDoubleClickHandler = useDoubleClick(activationCallback);

	// const [test, setTest] = useState(0);
	// const clipDoubleClickHandler = useDoubleClick(() => {
	// 	dispatch(moveImage({ path: id, x: -2, y: 0 }));
	// setTest(2);
	// dispatch(deselectPath());
	// });

	const path = useMemo(() => {
		const p = new Shape();
		p.moveTo(x, y);
		p.lineTo(x + 5, y);
		p.lineTo(x + 5, y + 5);
		p.lineTo(x, y + 5);
		p.closePath();
		return p;
	}, [x, y]);

	const [offset, setOffset] = useState(0);
	const [hovered, setHover] = useState(false);
	const uvs: Float32Array = useMemo<Float32Array>(
		() =>
			new Float32Array([
				offset,
				offset,
				offset,
				5 + offset,
				5 + offset,
				5 + offset,
				5 + offset,
				offset,
			]),
		[offset],
	);

	// useEffect(() => {
	// const points = path.getPoints();
	// console.log(points);
	// if (geometry.current) {
	// 	geometry.current.setFromPoints(points);
	// 	geometry.current.elementsNeedUpdate = true;
	// }

	// }, [path])

	/*const clip = useMemo(() => {
		const c = new Shape();

		c.moveTo(-100, -100);
		c.lineTo(-100, 100);
		c.lineTo(100, 100);
		c.lineTo(100, -100);
		c.closePath();

		c.holes = [path];

		return c;
	}, [path]);

	const imagePath = useMemo(() => {
		const p = new Shape();

		p.moveTo(x, y);
		p.lineTo(x + backgroundWidth, y);
		p.lineTo(x + backgroundWidth, y + backgroundWidth);
		p.lineTo(x, y + backgroundWidth);
		p.closePath();

		return p;
	}, []);

	
	const aspect = size.width / viewport.width;

	const bind = useGesture(
		{
			onDrag: (args) => {
				const {delta, movement } = args;
				const {
					offset: [x, y],
				} = args;
				if (currentActive) {
					//console.log(delta, movement);
					setImagePathSpring({
						position: [x / (aspect * zoom), -y / (aspect * zoom), 1],
					});
				}
			},
		},
		{
			eventOptions: { pointer: true },
		},
	);*/

	// const currentActive = active === id;
	// useEffect(() => {
	// 	setClipSpring({ opacity: currentActive ? 0.6 : 0 });
	// 	setPathSpring({ opacity: currentActive ? 0 : 1 });
	// 	setImagePathSpring({ opacity: currentActive ? 1 : 0 });
	// }, [currentActive]);
	
	
	const uvref = useRef<BufferAttribute>();
	/*useEffect(() => {
		if (uvref.current) {
			uvref.current.needsUpdate = true;
		}
	}, [offset]);*/

	// quando viene caricato il background aggiorno il materiale
	useEffect(() => {
		if (background && material.current) {
			material.current.needsUpdate = true;
		}
	}, [background]);

	return (
		<>
			<mesh
				position={[0, 0, 1]}
				ref={mesh}
				onClick={
					imagePathDoubleClickHandler
					// () => camera.layers.toggle(0)
				}
				onPointerOver={() => setHover(true)}
				onPointerOut={() => setHover(false)}
				layers={[0]}
			>
				<meshBasicMaterial
					attach="material"
					map={background}
					visible={active === null}
					opacity={hovered ? 0.7 : 1}
					ref={material}
				/>
				<shapeBufferGeometry ref={geometry} attach="geometry" args={[path]}>
					<bufferAttribute
						attachObject={['attributes', 'uv']}
						count={4}
						array={uvs}
						itemSize={2}
						ref={uvref}
					/>
				</shapeBufferGeometry>
			</mesh>
		</>
	);
};
