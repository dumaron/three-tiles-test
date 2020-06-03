import React from 'react';
import { Canvas } from 'react-three-fiber';
import { useSelector } from 'react-redux';
import { RootState } from './logic/rootReducer';
import { Provider } from 'react-redux';
import { store } from './logic/store';
import { MapControls } from 'drei';
import { Editor } from './components/Editor';

export const App: React.FC = () => {
	const { selectedPath } = useSelector((state: RootState) => state.editor);

	return (
		<div className="App">
			<Canvas
				orthographic
				invalidateFrameloop={true}
				camera={{
					position: [0, 0, 40],
					up: [0, 0, 1],
					zoom: 10,
					near: 1,
					far: 20000,
				}}
			>
				<Provider store={store}>
					<MapControls enableDamping={false} enableRotate={false} />
					<ambientLight />
					<Editor />
				</Provider>
			</Canvas>
		</div>
	);
};
