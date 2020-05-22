import React, { useEffect, useRef, useState } from 'react';
import { Rect } from './Rect';
import { useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import { Box3, Group, Sphere, Texture, TextureLoader } from 'three';

export const Editor: React.FC = () => {
	const groupRef = useRef<Group>();
	const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});

	const neededImages = Object.values(images).reduce<string[]>((tot, association) => {
		if (!tot.includes(association.image)) {
			tot.push(association.image);
		}
		return tot;
	}, []);
	const check = neededImages.join('');

	useEffect(() => {
		const loader = new TextureLoader();
		const imageSize = 10;
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
		if (groupRef.current) {
			const box = new Box3().setFromObject(groupRef.current);
			const sphere = new Sphere();
			box.getBoundingSphere(sphere);
			setCenter([-sphere.center.x, -sphere.center.y, 0]);
		}
	}, []);
	

	return (
		<group position={center as [number, number, number]} ref={groupRef}>
			{Object.entries(scheme.paths).map(([id, [x, y]]) => {
				const background = backgrounds[images[id]?.image];
				return (
					<Rect
						key={id}
						x={x}
						y={y}
						id={id}
						active={selectedPath}
						background={background}
						backgroundWidth={10}
					/>
				);
			})}
		</group>
	);
};
