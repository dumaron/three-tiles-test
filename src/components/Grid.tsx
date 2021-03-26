export const tmp = 'tmp'
/*
import React, { useMemo } from 'react';
import { Line } from 'drei';

interface GridProps {
	center: [number, number, 0];
}

const total = new Array(1000).fill(null);
const color = '#aaa';

export const Grid: React.FC<GridProps> = React.memo(({ center }) => {
	const centerIsSetted = useMemo(() => center[0] !== 0 && center[1] !== 0, [center]);
	const verticalPoints = useMemo<[number, number, number][]>(
		() => [
			[0, 10000, 0],
			[0, -10000, 0],
		],
		[center],
	);
	const horizontalPoints = useMemo<[number, number, number][]>(
		() => [
			[10000, 0, 0],
			[-10000, 0, 0],
		],
		[center],
	);

	const half = (total.length / 2) * 50;

	return (
		<>
			{centerIsSetted &&
				total.map((_, i) => {
					return (
						<>
							<Line
								key={'v' + i}
								position={[i * 50 - half, 0, 0]}
								points={verticalPoints}
								color={color}
								linewidth={0.1}
							/>
							<Line
								key={'h' + i}
								position={[0, i * 50 - half, 0]}
								points={horizontalPoints}
								color={color}
								linewidth={0.1}
							/>
						</>
					);
				})}
		</>
	);
});
*/
