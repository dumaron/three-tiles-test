import React from 'react';
import { Canvas } from 'react-three-fiber';
import { Provider } from 'react-redux';
import { store } from './logic/store';
import { MapControls } from 'drei';
import { Editor } from './components/Editor';
import { Instructions } from './components/Instructions';

export const App: React.FC = () => {
	return (
		<div className="App">
			<Canvas
				orthographic
				invalidateFrameloop={true}
				camera={{
					position: [0, 0, 2],
					up: [0, 0, 1],
					zoom: 1,
					near: 0.1,
					far: 20000,
				}}
			>
				<Provider store={store}>
					<MapControls enableDamping={false} enableRotate={false} />
					<ambientLight />
					<Editor />
				</Provider>
			</Canvas>
			<Provider store={store}>
				<Instructions />
			</Provider>
		</div>
	);
};
