import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import { Color, Shape, Texture, TextureLoader } from 'three';
import { useThree } from 'react-three-fiber';
import { parseSvgPath } from '../utils/svg';
import { deselectPath } from '../logic/slices/editorSlice';
import { moveImage } from '../logic/slices/loadedSchemeSlice';
import { PathOverlay } from './PathOverlay';
import { FreeModeImage } from './FreeModeImage';
import { PoseScheme } from './PoseScheme';
import { Grid } from './Grid';
import { TemporaryMovementData } from '../types/editor';

const imageSize = 200;

export const Editor: React.FC = () => {
	const dispatch = useDispatch();
	const temporaryMovementData = useRef<TemporaryMovementData>({
		x: 0,
		y: 0,
		rotation: 0,
	});
	const { camera, raycaster, gl, scene } = useThree();
	const { scheme, associations } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState<[number, number, 0]>([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});
	const selectedPathBackground = useMemo(
		() => (selectedPath ? backgrounds[associations[selectedPath]?.image] : null),
		[selectedPath],
	);

	const onMove = useCallback((data: TemporaryMovementData) => {
		temporaryMovementData.current = data;
	}, []);

	// allineo al centro lo schema di posa
	useEffect(() => {
		camera.layers.enable(0);
		camera.layers.disable(1);
		raycaster.layers.enable(0);
		raycaster.layers.disable(1);
		gl.localClippingEnabled = true;
		scene.background = new Color('#ddd');
	}, []);

	const parsedSelectedPath = useMemo<Shape | null>(() => {
		if (!selectedPath) {
			return null;
		}
		const d = scheme.paths[selectedPath];
		return parseSvgPath(d);
	}, [selectedPath]);

	const neededImages = Object.values(associations).reduce<string[]>(
		(tot, association) => {
			if (!tot.includes(association.image)) {
				tot.push(association.image);
			}
			return tot;
		},
		[],
	);
	
	console.log(neededImages);
	const check = neededImages.join('');

	// carico lo sfondo e lo setto come stato interno
	useEffect(() => {
		console.log('test')
		const loader = new TextureLoader();
		neededImages.forEach((image) => {
			console.log('image:', image)
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

			const handleEsc = (event: any) => {
				if (event.keyCode === 27) {
					const { x, y, rotation } = temporaryMovementData.current;
					dispatch(moveImage({ path: selectedPath, x, y, rotation }));
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
			<PathOverlay center={center} pathShape={parsedSelectedPath} />
			<FreeModeImage
				texture={selectedPathBackground}
				pathShape={parsedSelectedPath}
				materialSize={imageSize}
				center={center}
				onMove={onMove}
			/>
			{/*<Grid center={center} />*/}
			<PoseScheme
				center={center}
				setCenter={setCenter}
				imageSize={imageSize}
				backgrounds={backgrounds}
			/>
		</>
	);
};

// @ts-ignore
Editor.whyDidYouRender = true;
