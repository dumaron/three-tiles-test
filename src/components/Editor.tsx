import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from './Path';
import { useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import {
	Box3,
	Geometry,
	Group,
	Mesh,
	Shape,
	ShapeBufferGeometry,
	Sphere,
	Texture,
	TextureLoader,
} from 'three';
import { useThree } from 'react-three-fiber';

export const Editor: React.FC = () => {
	const { camera } = useThree();
	const groupRef = useRef<Group>();
	const outlineMesh = useRef<ShapeBufferGeometry>();
	const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});

	const selectedPathOutline = useMemo<Shape>(() => {
		const c = new Shape();
		const p = new Shape();

		/*if (selectedPath) {
			const [x, y] = scheme.paths[selectedPath];
			
			p.moveTo(x, y);
			p.lineTo(x + 5, y);
			p.lineTo(x + 5, y + 5);
			p.lineTo(x, y + 5);
			p.closePath();
			c.moveTo(-100, -100);
			c.lineTo(-100, 100);
			c.lineTo(100, 100);
			c.lineTo(100, -100);
			c.closePath();
			c.holes = [p];
			console.log(p.getPoints());
		}*/

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

	// allineo al centro
	useEffect(() => {
		if (groupRef.current) {
			const box = new Box3().setFromObject(groupRef.current);
			const sphere = new Sphere();
			box.getBoundingSphere(sphere);
			setCenter([-sphere.center.x, -sphere.center.y, 0]);
		}
	}, []);

	useEffect(() => {
		if (selectedPath) {
			camera.layers.toggle(0); // nascondo il layer dei materiali assegnati
			// outlineMesh.current && (outlineMesh.current.material.needsUpdate = true);
			console.log(outlineMesh.current?.attributes.position);
		}
	}, [selectedPath]);

	return (
		<>
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
							backgroundWidth={10}
						/>
					);
				})}
			</group>
			<mesh position={[0, 0, 1]}>
				{/* NOTA BENE: se non si mette transparent=true non funziona*/}
				<meshBasicMaterial
					attach="material"
					color={'black'}
					opacity={0.6}
					transparent={true}
				/>
				<shapeBufferGeometry
					attach="geometry"
					args={[selectedPathOutline]}
					ref={outlineMesh}
				>
					<bufferAttribute />
				</shapeBufferGeometry>
			</mesh>
		</>
	);
};
