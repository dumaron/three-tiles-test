import React, { useMemo } from 'react';
import { Shape } from 'three';

interface PathOverlayProps {
	center: [number, number, number];
	pathShape: Shape | null;
}

export const PathOverlay: React.FC<PathOverlayProps> = React.memo(
	({ center, pathShape }) => {
		const selectedPathOutline = useMemo<Shape>(() => {
			const c = new Shape();
			c.moveTo(-100000, -100000);
			c.lineTo(-100000, 100000);
			c.lineTo(100000, 100000);
			c.lineTo(100000, -100000);
			c.closePath();

			if (pathShape) {
				c.holes = [pathShape];
			}

			return c;
		}, [pathShape]);

		return (
			<mesh position={center} layers={[1]} renderOrder={999} onBeforeRender={(renderer) => {
			}}>
				<meshBasicMaterial
					attach="material"
					color={'black'}
					opacity={0.777}
					transparent={true}
					depthTest={false}
				/>
				<shapeBufferGeometry attach="geometry" args={[selectedPathOutline]} />
			</mesh>
		);
	},
);
