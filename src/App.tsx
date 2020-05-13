import React, { useEffect, useState } from 'react';
import './App.css';
import { Canvas } from 'react-three-fiber';
import { Rect } from './components/Rect';
import { Texture, TextureLoader } from 'three';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './logic/rootReducer';
import { actions } from './logic/slices/editor';

export const App: React.FC = () => {
	const dispatch = useDispatch();
	const { scheme, selectedPath } = useSelector((state: RootState) => state.editor);

	const [background, setBackground] = useState<Texture | null>(null);

	useEffect(() => {
		const loader = new TextureLoader();
		const imageSize = 10;
		loader.load('panel1.jpeg', (image) => {
			image.repeat.set(1 / imageSize, 1 / imageSize);
			setBackground(image);
		});
	}, []);

	return (
		<div className="App">
			<Canvas
				camera={{
					fov: 30,
					position: [0, 0, 40],
					near: 1,
					far: 20000,
				}}
			>
				<ambientLight />
				{Object.entries(scheme.paths).map(([id, [x, y]]) => (
					<Rect
						key={id}
						x={x}
						y={y}
						id={id}
						active={selectedPath}
						background={background}
						setActive={() =>
							dispatch(
								selectedPath === null
									? actions.selectPath(id)
									: actions.deselectPath(),
							)
						}
						backgroundWidth={10}
					/>
				))}
			</Canvas>
		</div>
	);
};
