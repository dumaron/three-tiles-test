import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from './Path';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import {
	Box3,
	// Geometry,
	Group,
	Mesh,
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
import { useGesture } from 'react-use-gesture';
import { animated } from '@react-spring/three';
import { useSpring } from '@react-spring/core';

const imageSize = 200;

export const Editor: React.FC = () => {
	const dispatch = useDispatch();
	const { camera, size, viewport, raycaster } = useThree();
	const aspect = size.width / viewport.width;
	const groupRef = useRef<Group>();
	const imageRef = useRef<Mesh>();
	const outlineMesh = useRef<ShapeBufferGeometry>();
	const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});
	const imageMaterialRef = useRef<MeshBasicMaterial>();
	const initialCoords = useRef<[number, number, 0]>([0, 0, 0]);

	const selectedPathBackground = useMemo(
		() => (selectedPath ? backgrounds[images[selectedPath]?.image] : null),
		[selectedPath],
	);

	// allineo al centro lo schema di posa
	useEffect(() => {
		camera.layers.enable(0);
		camera.layers.disable(1);
		raycaster.layers.enable(0);
		raycaster.layers.disable(1);

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
		c.moveTo(-100000, -100000);
		c.lineTo(-100000, 100000);
		c.lineTo(100000, 100000);
		c.lineTo(100000, -100000);
		c.closePath();

		if (parsedSelectedPath) {
			c.holes = [parsedSelectedPath];
		}

		return c;
	}, [parsedSelectedPath]);

	const [spring, setSpring] = useSpring(() => ({
		to: {
			position: [0, 0, 0],
		},
	}));

	const bind = useGesture(
		{
			onDragStart: () => {
				console.log(camera);
			},
			onDrag: (e) => {
				// console.log(e.offset);
				// console.log(aspect);
				// console.log(initialCoords.current);
				e.event?.nativeEvent.stopPropagation();
				e.event?.nativeEvent.preventDefault();
				setSpring({
					to: {
						position: [
							initialCoords.current[0] + (e.offset[0] / camera.zoom),
							initialCoords.current[1] - (e.offset[1] / camera.zoom),
							0,
						],
					},
				});
			},
		},
		{ eventOptions: { pointer: true } },
	);

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
			camera.layers.disable(0);
			camera.layers.enable(1);
			raycaster.layers.disable(0);
			raycaster.layers.enable(1);

			if (imageMaterialRef.current !== undefined) {
				// @ts-ignore
				imageMaterialRef.current.needsUpdate = true;
				// TODO move in react-three-fiber and handle updates accordingly
				// @ts-ignore
				imageRef.current.geometry.attributes.uv.array = new Float32Array([
					0,
					imageSize,
					imageSize,
					imageSize,
					0,
					0,
					imageSize,
					0,
				]);
			}

			const x = center[0] + (selectedPathCenter?.x || 0);
			const y = center[1] + (selectedPathCenter?.y || 0);
			initialCoords.current = [x, y, 0];
			setSpring({ to: { position: [x, y, 0] }, immediate: true });

			const handleEsc = (event: any) => {
				if (event.keyCode === 27) {
					dispatch(deselectPath());
				}
			};
			window.addEventListener('keydown', handleEsc);

			return () => window.removeEventListener('keydown', handleEsc);
		} else {
			camera.layers.enable(0);
			camera.layers.disable(1);
			raycaster.layers.enable(0);
			raycaster.layers.disable(1);
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
				NOTA BENE: se non si mette transparent=true non funziona
				<meshBasicMaterial
					attach="material"
					color={'black'}
					opacity={0.777}
					transparent={true}
				/>
				<shapeBufferGeometry
					attach="geometry"
					args={[selectedPathOutline]}
					ref={outlineMesh}
				/>
			</mesh>
			<animated.mesh
				{...bind()}
				position={spring.position as any}
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
			</animated.mesh>
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

// @ts-ignore
Editor.whyDidYouRender = true;
