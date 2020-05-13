import React, { useMemo, useRef, useState } from 'react';
import { Shape, Texture, Vector2 } from 'three';
import { useThree } from 'react-three-fiber';
import { useGesture } from 'react-use-gesture';
import { useSpring, animated } from 'react-spring/three';

interface RectPropsInterface {
	x: number;
	y: number;
	setActive: () => void;
	active: string | null;
	id: string;
	background: null | Texture;
	backgroundWidth: number;
}

export const Rect: React.FC<RectPropsInterface> = ({
	x,
	y,
	id,
	active,
	setActive,
	background,
	backgroundWidth,
}) => {
	const mesh = useRef();
	// const randomOffset = useMemo(() => Math.random() * 5, []);
	const randomOffset = Number(id) || 0;
	const [spring, set] = useSpring(() => ({
		position: [0, 0, 1],
		config: { mass: 1, friction: 60, tension: 800 }
	}));
	const { size, viewport } = useThree();

	const path = useMemo(() => {
		const p = new Shape();

		p.moveTo(x, y);
		p.lineTo(x + 5, y);
		p.lineTo(x + 5, y + 5);
		p.lineTo(x, y + 5);
		p.closePath();

		return p;
	}, [x, y]);

	const clip = useMemo(() => {
		const c = new Shape();

		c.moveTo(-100, -100);
		c.lineTo(-100, 100);
		c.lineTo(100, 100);
		c.lineTo(100, -100);
		c.closePath();

		c.holes = [path];

		return c;
	}, [path]);

	const imagePath = useMemo(() => {
		const p = new Shape();

		p.moveTo(x - randomOffset, y - randomOffset);
		p.lineTo(x + backgroundWidth - randomOffset, y - randomOffset);
		p.lineTo(x + backgroundWidth - randomOffset, y + backgroundWidth - randomOffset);
		p.lineTo(x - randomOffset, y + backgroundWidth - randomOffset);
		p.closePath();

		return p;
	}, []);

	const geometry = useRef();
	const [hovered, setHover] = useState(false);
	const aspect = size.width / viewport.width;

	const bind = useGesture(
		{
			onDrag: ({ offset: [x, y] }) =>
				set({
					position: [x / aspect, -y / aspect, 1],
				}),
		},
		{
			eventOptions: { pointer: true },
		},
	);

	const currentActive = active === id;

	return (
		<>
			<animated.mesh
				position={[0, 0, 1]}
				ref={mesh}
				{...(bind() as any)}
				onClick={setActive}
				onPointerOver={() => setHover(true)}
				onPointerOut={() => setHover(false)}
			>
				<meshBasicMaterial
					attach="material"
					map={background || null}
					color={'white'}
					visible={active === null}
					opacity={hovered ? 0.7 : 1}
					transparent={true}
				/>
				<shapeGeometry
					ref={geometry}
					attach="geometry"
					args={[path]}
					faceVertexUvs={[
						[
							[
								new Vector2(randomOffset, 5 + randomOffset),
								new Vector2(randomOffset, randomOffset),
								new Vector2(5 + randomOffset, randomOffset),
							],
							[
								new Vector2(5 + randomOffset, randomOffset),
								new Vector2(5 + randomOffset, 5 + randomOffset),
								new Vector2(randomOffset, 5 + randomOffset),
							],
						],
					]}
				/>
			</animated.mesh>

			{currentActive && (
				<>
					<mesh position={[0, 0, 1]}>
						{/* NOTA BENE: se non si mette transparent=true non funziona*/}
						<meshBasicMaterial
							attach="material"
							color={'black'}
							opacity={0.6}
							transparent={true}
						/>
						<shapeGeometry attach="geometry" args={[clip]} />
					</mesh>
					<animated.mesh position={spring.position} {...(bind() as any)}>
						<meshBasicMaterial attach="material" map={background || null} />
						<shapeGeometry
							attach="geometry"
							args={[imagePath]}
							faceVertexUvs={[
								[
									[
										new Vector2(0, backgroundWidth),
										new Vector2(0, 0),
										new Vector2(backgroundWidth, 0),
									],
									[
										new Vector2(backgroundWidth, -0),
										new Vector2(backgroundWidth, backgroundWidth),
										new Vector2(0, backgroundWidth),
									],
								],
							]}
						/>
					</animated.mesh>
				</>
			)}
		</>
	);
};
