import React, { useEffect, useMemo, useRef } from 'react';
import { Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Texture } from 'three';
import { animated, useSpring } from '@react-spring/three';
import { useGesture } from 'react-use-gesture';
import { useThree } from 'react-three-fiber';
import { get2dCenter } from '../utils/three';

interface FreeModeImageProps {
	texture: Texture | null;
	pathShape: Shape | null;
	materialSize: number;
	center: [number, number, 0];
}

export const FreeModeImage: React.FC<FreeModeImageProps> = React.memo(
	({ texture, materialSize, pathShape, center }) => {
		const imageRef = useRef<Mesh>();
		const imageMaterialRef = useRef<MeshBasicMaterial>();
		const initialAngle = useRef(0);
		const initialCoords = useRef<[number, number, 0]>([0, 0, 0]);
		const { camera, raycaster } = useThree();
		const rotating = useRef(false);

		const selectedPathCenter = useMemo(() => {
			if (!pathShape) {
				return null;
			}
			const tmp = new ShapeGeometry(pathShape);
			return get2dCenter(tmp);
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
					rotating.current = e.ctrlKey;
					if (rotating.current) {
						const center = imageRef.current?.position || { x: 0, y: 0, z: 0 };
						const p = raycaster.ray.origin;
						let angle = Math.atan2(-p.x + center.x, p.y - center.y);
						initialAngle.current = angle - rotation.goal[2];
					} else {
						initialCoords.current = [position.goal[0], position.goal[1], 0];
					}
				},
				onDrag: (e) => {
					e.event?.nativeEvent.stopPropagation();
					e.event?.nativeEvent.preventDefault();
					
					if (rotating.current) {
						const center = imageRef.current?.position || { x: 0, y: 0, z: 0 };
						const p = raycaster.ray.origin;
						let angle = Math.atan2(-p.x + center.x, p.y - center.y);

						setRotation({
							rotation: [0, 0, angle - initialAngle.current],
							immediate: true,
						});
					} else {
						setPosition({
							position: [
								initialCoords.current[0] + e.movement[0] / camera.zoom,
								initialCoords.current[1] - e.movement[1] / camera.zoom,
								0,
							],
						});
					}
				},
			},
			{ eventOptions: { pointer: true } },
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

				const x = center[0] + (selectedPathCenter?.x || 0);
				const y = center[1] + (selectedPathCenter?.y || 0);
				initialCoords.current = [x, y, 0];
				setPosition({ position: [x, y, 0], immediate: true });
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
			>
				<meshBasicMaterial attach="material" map={texture} ref={imageMaterialRef} />
				<planeBufferGeometry attach="geometry" args={[materialSize, materialSize]} />
			</animated.mesh>
		);
	},
);
