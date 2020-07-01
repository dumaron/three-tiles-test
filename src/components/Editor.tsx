import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Path } from './Path';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import {
	Box3,
	Color,
	Group,
	Plane,
	Shape,
	Sphere,
	Texture,
	TextureLoader,
	Vector3,
} from 'three';
import { useThree } from 'react-three-fiber';
import { parseSvgPath } from '../utils/svg';
import { deselectPath } from '../logic/slices/editorSlice';
import { PathOverlay } from './PathOverlay';
import { FreeModeImage } from './FreeModeImage';

const imageSize = 200;

export const Editor: React.FC = () => {
	const dispatch = useDispatch();
	const { camera, raycaster, gl, scene } = useThree();
	const groupRef = useRef<Group>();
	const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
	const { selectedPath } = useSelector((state: RootState) => state.editor);
	const [center, setCenter] = useState<[number, number, 0]>([0, 0, 0]);
	const [backgrounds, setBackgrounds] = useState<{ [key: string]: Texture }>({});
	const selectedPathBackground = useMemo(
		() => (selectedPath ? backgrounds[images[selectedPath]?.image] : null),
		[selectedPath],
	);

	const viewBox = useMemo<Plane[]>(() => {
		console.log(center);
		return [
			new Plane(new Vector3(0, 1, 0), -scheme.viewBox[1] - center[1]),
			new Plane(
				new Vector3(0, -1, 0),
				scheme.viewBox[1] + scheme.viewBox[3] + center[1],
			),
			new Plane(new Vector3(1, 0, 0), -scheme.viewBox[0] - center[0]),
			new Plane(
				new Vector3(-1, 0, 0),
				scheme.viewBox[0] + scheme.viewBox[2] + center[0],
			),
			// new Plane(new Vector3(0, -1, 0), 370),
			// new Plane(new Vector3(0, 1, 0), 320),
			// new Plane(new Vector3(1, 0, 0), scheme.viewBox[2])
		];
	}, [scheme.viewBox, center]);

	// allineo al centro lo schema di posa
	useEffect(() => {
		camera.layers.enable(0);
		camera.layers.disable(1);
		raycaster.layers.enable(0);
		raycaster.layers.disable(1);
		gl.localClippingEnabled = true;
		scene.background = new Color('#ddd');

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
			<PathOverlay center={center} pathShape={parsedSelectedPath} />
			<FreeModeImage
				texture={selectedPathBackground}
				pathShape={parsedSelectedPath}
				materialSize={imageSize}
				center={center}
			/>
			<group position={center} ref={groupRef}>
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
							viewBox={viewBox}
						/>
					);
				})}
			</group>
		</>
	);
};

// @ts-ignore
Editor.whyDidYouRender = true;
