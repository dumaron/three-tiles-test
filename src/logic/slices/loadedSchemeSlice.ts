import { ImageAssociationInterface, SchemeInterface } from '../../types/schema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {svg} from '../../svg'

export interface SchemeEditorState {
	scheme: SchemeInterface;
	images: {
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
	return tot;
}, {});

const initialState: SchemeEditorState = {
	scheme: svg,
	images: basicAssociations,
};

export const loadedSchemeSlice = createSlice({
	name: 'loadedScheme',
	initialState,
	reducers: {
		moveImage(state, action: PayloadAction<{ path: string; x: number; y: number }>) {
			const { x, y, path } = action.payload;
			const img = state.images[path];
			if (img) {
				img.x = x;
				img.y = y;
			}
		},
	},
});

export const { moveImage } = loadedSchemeSlice.actions;
