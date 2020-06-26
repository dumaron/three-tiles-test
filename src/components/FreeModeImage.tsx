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
		const initialCoords = useRef<[number, number, 0]>([0, 0, 0]);
		const { camera } = useThree();

		const selectedPathCenter = useMemo(() => {
			if (!pathShape) {
				return null;
			}
			const tmp = new ShapeGeometry(pathShape);
			return get2dCenter(tmp);
		}, [pathShape]);

		const [spring, setSpring] = useSpring(() => ({
			to: {
				position: [0, 0, 0],
			},
		}));

		const bind = useGesture(
			{
				onDrag: (e) => {
					e.event?.nativeEvent.stopPropagation();
					e.event?.nativeEvent.preventDefault();
					setSpring({
						to: {
							position: [
								initialCoords.current[0] + e.offset[0] / camera.zoom,
								initialCoords.current[1] - e.offset[1] / camera.zoom,
								0,
							],
						},
					});
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
				setSpring({ to: { position: [x, y, 0] }, immediate: true });
			}
		}, [pathShape]);

		return (
			<animated.mesh
				{...bind()}
				position={spring.position as any}
				layers={[1]}
				ref={imageRef}
			>
				<meshBasicMaterial attach="material" map={texture} ref={imageMaterialRef} />
				<planeBufferGeometry attach="geometry" args={[materialSize, materialSize]} />
			</animated.mesh>
		);
	},
);
