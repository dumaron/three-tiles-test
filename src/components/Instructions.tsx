import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../logic/rootReducer';

interface InstructionsProps {}

export const Instructions: React.FC<InstructionsProps> = () => {
	const moveMode = useSelector((state: RootState) => state.editor.selectedPath);
	const viewMode = !moveMode;

	
	
	return (
		<div id={'instructions'} className={moveMode ? 'move-mode' : 'view-mode'}>
			<h2>You are in <span className={'underline'}>{moveMode ? 'Move' : 'View'}</span> mode</h2>
			{viewMode && (
				<ul>
					<li>
						Hold <span className={'command'}>Mouse left button</span> and move the
						mouse to travel in the editor
					</li>
					<li>
						<span className={'command'}>Wheel in/out</span> to increase/decrease the
						zoom
					</li>
					<li>
						<span className={'command'}>Double click</span> on a element to enter
						Move Mode
					</li>
					<li>
						Press <span className={'command'}>Ctrl + z</span> to undo
					</li>
				</ul>
			)}
			{moveMode && (
				<ul>
					<li>
						Hold <span className={'command'}>Mouse left button</span> over the panel
						to drag the panel
					</li>
					<li>
						Hold <span className={'command'}>Ctrl</span> and the{' '}
						<span className={'command'}>Mouse left button</span> to rotate the panel
					</li>
					<li>
						Hold <span className={'command'}>Mouse left button</span> over the
						background and move the mouse to move in the editor
					</li>
					<li>
						<span className={'command'}>Wheel in/out</span> to increase/decrease the
						zoom
					</li>
				</ul>
			)}
		</div>
	);
};
