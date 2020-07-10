import React, { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { Path } from './Path';
import { Box3, Group, Plane, Sphere, Texture, Vector3 } from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';

interface PoseSchemeProps {
	center: [number, number, 0];
	setCenter: Dispatch<SetStateAction<[number, number, 0]>>;
	imageSize: number;
	backgrounds: { [key: string]: Texture };
}

export const PoseScheme: React.FC<PoseSchemeProps> = React.memo(
	({ center, setCenter, imageSize, backgrounds }) => {
		const groupRef = useRef<Group>();
		const { scheme, images } = useSelector((state: RootState) => state.loadedScheme);
		const { selectedPath } = useSelector((state: RootState) => state.editor);
		const viewBox = useMemo<Plane[]>(() => {
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
			];
		}, [scheme.viewBox, center]);

		useEffect(() => {
			if (groupRef.current) {
				const box = new Box3().setFromObject(groupRef.current);
				const sphere = new Sphere();
				box.getBoundingSphere(sphere);
				setCenter([-sphere.center.x, -sphere.center.y, 0]);
			}
		}, []);

		return (
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
		);
	},
);
