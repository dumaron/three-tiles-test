import { ImageAssociationInterface, SchemeInterface } from '../../types/schema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { svg } from '../../svg';

export interface SchemeEditorState {
	scheme: SchemeInterface;
	associations: {
		[key: string]: ImageAssociationInterface;
	};
}

const basicAssociations = Object.keys(svg.paths).reduce<{
	[key: string]: ImageAssociationInterface;
}>((tot, key) => {
	tot[key] = {
		image: 'panel1.jpeg',
		x: 0,
		y: 0,
		rotation: 0,
	};

	/*if (key === '3341') {
		tot[key].x = 100;
		tot[key].y = 100;
	}*/
	
	return tot;
}, {});

const initialState: SchemeEditorState = {
	scheme: svg,
	associations: basicAssociations,
};

export const loadedSchemeSlice = createSlice({
	name: 'loadedScheme',
	initialState,
	reducers: {
		moveImage(
			state,
			action: PayloadAction<{ path: string; x: number; y: number; rotation: number }>,
		) {
			const { x, y, rotation, path } = action.payload;
			const association = state.associations[path];
			if (association) {
				association.x = x;
				association.y = y;
				association.rotation = rotation;
			}
		},
	},
});

export const { moveImage } = loadedSchemeSlice.actions;
