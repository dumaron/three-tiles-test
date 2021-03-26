import React, { useEffect, useMemo, useRef } from 'react';
import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Texture } from 'three';
import { animated, useSpring } from '@react-spring/three';
import { useGesture } from 'react-use-gesture';
import { useThree } from 'react-three-fiber';
import { get2dCenter } from '../utils/three';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';
import { MathUtils } from 'three';
import { setHoveringFreeImage } from '../logic/slices/editorSlice';


interface FreeModeImageProps {
	texture: Texture | null;
	pathShape: Shape | null;
	materialSize: number;
	center: [number, number, 0];
	onMove: (args: { x: number; y: number; rotation: number }) => void;
}

export const FreeModeImage: React.FC<FreeModeImageProps> = React.memo(
	({ texture, materialSize, pathShape, center, onMove }) => {
		const dispatch = useDispatch();
		const imageRef = useRef<Mesh>();
		const imageMaterialRef = useRef<MeshBasicMaterial>();
		const initialAngle = useRef(0);
		const initialCoords = useRef<[number, number, 0]>([0, 0, 0]);
		const { camera, raycaster } = useThree();
		const { selectedPath } = useSelector((state: RootState) => state.editor);
		const imageAssociation = useSelector((state: RootState) =>
			selectedPath ? state.loadedScheme.associations[selectedPath] : null,
		);
		const rotating = useRef(false);

		const selectedPathCenter = useMemo<{ x: number; y: number }>(() => {
			if (!pathShape) {
				return { x: 0, y: 0 };
			}
			return get2dCenter(new ShapeGeometry(pathShape));
		}, [pathShape]);

		const [{ position }, setPosition] = useSpring(() => ({
			position: [0, 0, 0],
			config: {
				mass: 1,
				friction: 60,
				tension: 800,
			},
			immediate: true,
		}));

		const [{ rotation }, setRotation] = useSpring(() => ({
			rotation: [0, 0, 0],
			immediate: true,
		}));

		const bind = useGesture(
			{
				onDragStart: (e) => {
					// e.event?.stopPropagation?.()
					// e.event?.preventDefault?.()
					// @ts-ignore
					// e.event?.nativeEvent.preventDefault()
					// @ts-ignore
					// e.event?.nativeEvent.stopPropagation()
					initialCoords.current = [position.goal[0], position.goal[1], 0];
					rotating.current = e.ctrlKey;
					if (rotating.current) {
						const center = imageRef.current?.position || { x: 0, y: 0, z: 0 };
						const p = raycaster.ray.origin;
						let angle = Math.atan2(-p.x + center.x, p.y - center.y);
						initialAngle.current = angle - rotation.goal[2];
					}
				},
				onDrag: (e) => {
					// console.log(e.event);
					// e.event?.stopPropagation?.();
					// e.event?.preventDefault?.();
					// @ts-ignore
					// console.log(e.event.nativeEvent)
					// @ts-ignore
					// e.event?.nativeEvent.stopPropagation();
					// @ts-ignore
					// e.event?.nativeEvent.preventDefault();

					let x = initialCoords.current[0];
					let y = initialCoords.current[1];
					let r = rotation.goal[2];

					if (rotating.current) {
						const center = imageRef.current?.position || { x: 0, y: 0, z: 0 };
						const p = raycaster.ray.origin;
						let angle = Math.atan2(-p.x + center.x, p.y - center.y);
						setRotation({
							rotation: [0, 0, angle - initialAngle.current],
							immediate: true,
						});
					} else {
						x = x + e.movement[0] / camera.zoom;
						y = y - e.movement[1] / camera.zoom;
						setPosition({
							position: [x, y, 0],
						});
					}
					const diffX = selectedPathCenter.x + center[0]; // center 0 e 1 sono tendenzialmente negativi
					const diffY = selectedPathCenter.y + center[1];
					// console.log(selectedPathCenter, center);
					onMove({ x: x - diffX, y: y - diffY, rotation: MathUtils.radToDeg(r) });
				},
			}
		);

		useEffect(() => {
			if (pathShape) {
				if (imageMaterialRef.current !== undefined) {
					// @ts-ignore
					imageMaterialRef.current.needsUpdate = true;
					// TODO move in react-three-fiber and handle updates accordingly
					// @ts-ignore
					imageRef.current.geometry.attributes.uv.array = new Float32Array([
						0,
						materialSize,
						materialSize,
						materialSize,
						0,
						0,
						materialSize,
						0,
					]);
				}

				const x =
					center[0] + (selectedPathCenter?.x || 0) + (imageAssociation?.x || 0);
				const y =
					center[1] + (selectedPathCenter?.y || 0) + (imageAssociation?.y || 0);
				initialCoords.current = [x, y, 0];
				setPosition({ position: [x, y, 0], immediate: true });
				setRotation({
					rotation: [0, 0, MathUtils.degToRad(imageAssociation?.rotation || 0)],
					immediate: true,
				});
			}
		}, [pathShape]);

		return (
			<animated.mesh
				{...bind()}
				position={position as any}
				rotation={rotation as any}
				layers={[1]}
				ref={imageRef}
				renderOrder={0}
				onPointerOver={() => dispatch(setHoveringFreeImage(true))}
				onPointerOut={() => dispatch(setHoveringFreeImage(false))}
			>
				<meshBasicMaterial attach="material" map={texture} ref={imageMaterialRef} />
				<planeBufferGeometry attach="geometry" args={[materialSize, materialSize]} />
			</animated.mesh>
		);
	},
);
