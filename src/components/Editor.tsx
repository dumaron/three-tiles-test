import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from './Path';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import {
	Box3,
	// Geometry,
	Group,
	// Mesh,
	Shape,
	ShapeBufferGeometry,
	Sphere,
	Texture,
	TextureLoader,
} from 'three';
import { useThree } from 'react-three-fiber';
import { parseSvgPath } from '../utils/svg';
import { deselectPath } from '../logic/slices/editorSlice';

export const Editor: React.FC = () => {
	const dispatch = useDispatch();
	const { camera } = useThree();
	const groupRef = useRef<Group>();
	const outlineMesh = useRef<ShapeBufferGeometry>();
	const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});

	// allineo al centro
	useEffect(() => {
		camera.layers.enable(0);
		camera.layers.enable(1);
		if (groupRef.current) {
			const box = new Box3().setFromObject(groupRef.current);
			const sphere = new Sphere();
			box.getBoundingSphere(sphere);
			setCenter([-sphere.center.x, -sphere.center.y, 0]);
		}
	}, []);

	const selectedPathOutline = useMemo<Shape>(() => {
		const c = new Shape();
		c.moveTo(-1000, -1000);
		c.lineTo(-1000, 1000);
		c.lineTo(1000, 1000);
		c.lineTo(1000, -1000);
		c.closePath();

		if (selectedPath) {
			const d = scheme.paths[selectedPath];
			const shape = parseSvgPath(d);
			c.holes = [shape];
		}

		return c;
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
		const imageSize = 100;
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
			camera.layers.toggle(0); // nascondo il layer dei materiali assegnati

			const handleEsc = (event: any) => {
				if (event.keyCode === 27) {
					dispatch(deselectPath());
				}
			};
			window.addEventListener('keydown', handleEsc);

			return () => window.removeEventListener('keydown', handleEsc);
		} else {
			camera.layers.enable(0);
			return () => {};
		}

		
	}, [selectedPath]);

	return (
		<>
			<mesh position={center as [number, number, number]} layers={[1]} renderOrder={1}>
				{/* NOTA BENE: se non si mette transparent=true non funziona*/}
				<meshBasicMaterial
					attach="material"
					color={'black'}
					opacity={0.6}
					transparent={true}
					visible={!!selectedPath}
				/>
				<shapeBufferGeometry
					attach="geometry"
					args={[selectedPathOutline]}
					ref={outlineMesh}
				/>
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
							backgroundWidth={100}
						/>
					);
				})}
			</group>
		</>
	);
};
