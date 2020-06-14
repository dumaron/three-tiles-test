import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from './Path';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import {
	Box3,
	// Geometry,
	Group, Mesh,
	MeshBasicMaterial,
	// Mesh,
	Shape,
	ShapeBufferGeometry,
	ShapeGeometry,
	Sphere,
	Texture,
	TextureLoader,
} from 'three';
import { useThree } from 'react-three-fiber';
import { parseSvgPath } from '../utils/svg';
import { deselectPath } from '../logic/slices/editorSlice';
import { get2dCenter } from '../utils/three';

const imageSize = 200;

export const Editor: React.FC = () => {
	const dispatch = useDispatch();
	const { camera } = useThree();
	const groupRef = useRef<Group>();
	const imageRef = useRef<Mesh>();
	const outlineMesh = useRef<ShapeBufferGeometry>();
	const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});
	const imageMaterialRef = useRef<MeshBasicMaterial>();

	const selectedPathBackground = useMemo(
		() => (selectedPath ? backgrounds[images[selectedPath]?.image] : null),
		[selectedPath],
	);

	// const selectedImageShape = useMe

	// allineo al centro lo schema di posa
	useEffect(() => {
		camera.layers.enable(0);
		camera.layers.disable(1);
		if (groupRef.current) {
			const box = new Box3().setFromObject(groupRef.current);
			const sphere = new Sphere();
			box.getBoundingSphere(sphere);
			setCenter([-sphere.center.x, -sphere.center.y, 0]);
		}
	}, []);

	const parsedSelectedPath = useMemo<Shape | null>(() => {
		if (!selectedPath) {
			return null;
		}
		const d = scheme.paths[selectedPath];
		return parseSvgPath(d);
	}, [selectedPath]);

	const selectedPathCenter = useMemo(() => {
		if (!parsedSelectedPath) {
			return null;
		}
		const tmp = new ShapeGeometry(parsedSelectedPath);
		return get2dCenter(tmp);
	}, [parsedSelectedPath]);

	const selectedPathOutline = useMemo<Shape>(() => {
		const c = new Shape();
		c.moveTo(-1000, -1000);
		c.lineTo(-1000, 1000);
		c.lineTo(1000, 1000);
		c.lineTo(1000, -1000);
		c.closePath();

		if (parsedSelectedPath) {
			c.holes = [parsedSelectedPath];
		}

		return c;
	}, [parsedSelectedPath]);

	const selectedPathImagePosition = useMemo<{
		x: number;
		y: number;
		rotation: number;
	}>(() => {
		const x = center[0] + (selectedPathCenter?.x || 0);
		const y = center[1] + (selectedPathCenter?.y || 0);
		return { x, y, rotation: 0 };
	}, [selectedPath]);

	const neededImages = Object.values(images).reduce<string[]>((tot, association) => {
		if (!tot.includes(association.image)) {
			tot.push(association.image);
		}
		return tot;
	}, []);
	const check = neededImages.join('');

	// carico lo sfondo e lo setto come stato interno
	useEffect(() => {
		const loader = new TextureLoader();
		neededImages.forEach((image) => {
			loader.load(image, (texture) => {
				texture.repeat.set(1 / imageSize, 1 / imageSize);
				setBackgrounds({
					[image]: texture,
				});
			});
		});
	}, [check]);

	useEffect(() => {
		
		if (selectedPath) {
			camera.layers.enable(1);
			camera.layers.disable(0); // nascondo il layer dei materiali assegnati
			if (imageMaterialRef.current !== undefined) {
				// @ts-ignore
				imageMaterialRef.current.needsUpdate = true;
				// TODO move in react-three-fiber and handle updates accordingly
				// @ts-ignore
				imageRef.current.geometry.attributes.uv.array = new Float32Array([0, imageSize, imageSize, imageSize, 0, 0, imageSize, 0])
			}

			const handleEsc = (event: any) => {
				if (event.keyCode === 27) {
					dispatch(deselectPath());
				}
			};
			window.addEventListener('keydown', handleEsc);

			return () => window.removeEventListener('keydown', handleEsc);
		} else {
			camera.layers.disable(1);
			camera.layers.enable(0);
			return () => {};
		}

		
	}, [selectedPath]);


	return (
		<>
			<mesh
				position={center as [number, number, number]}
				layers={[1]}
				renderOrder={1}
				visible={!!selectedPath}
			>
				{/* NOTA BENE: se non si mette transparent=true non funziona*/}
				<meshBasicMaterial
					attach="material"
					color={'black'}
					opacity={0.9}
					transparent={true}
				/>
				<shapeBufferGeometry
					attach="geometry"
					args={[selectedPathOutline]}
					ref={outlineMesh}
				/>
			</mesh>
			<mesh
				position={[selectedPathImagePosition.x, selectedPathImagePosition.y, 0]}
				layers={[1]}
				ref={imageRef}
			>
				<meshBasicMaterial
					attach="material"
					map={selectedPathBackground}
					ref={imageMaterialRef}
					visible={!!selectedPath}
				/>
				<planeBufferGeometry attach="geometry" args={[imageSize, imageSize]} />
			</mesh>
			<group position={center as [number, number, number]} ref={groupRef}>
				{Object.entries(scheme.paths).map(([id, definition]) => {
					const background = backgrounds[images[id]?.image];
					return (
						<Path
							key={id}
							d={definition}
							id={id}
							active={selectedPath}
							background={background}
							backgroundWidth={imageSize}
						/>
					);
				})}
			</group>
		</>
	);
};
