import { useRef } from 'react';
import { PointerEvent } from 'react-three-fiber';

export const useDoubleClick = (callback: () => void) => {
	const ref = useRef<any>(null);
	const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

	return (e: PointerEvent) => {
		const timerIsRunning = timeout.current;
		if (timerIsRunning) {
			console.log(e.object.uuid, ref.current?.uuid);
			if (e.object === ref.current) {
				callback();
			}
		} else {
			timeout.current = setTimeout(() => {
				timeout.current = null;
				ref.current = null;
			}, 300);
		}
		ref.current = e.object;
	};
};
