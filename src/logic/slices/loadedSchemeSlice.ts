import { ImageAssociationInterface, SchemeInterface } from '../../types/schema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SchemeEditorState {
	scheme: SchemeInterface;
	images: {
		[key: string]: ImageAssociationInterface;
	};
}

const size = 5;
let c = 0,
	x,
	y;
const paths: { [key: string]: [number, number] } = {};

for (x = 0; x < size; x++) {
	for (y = 0; y < size; y++) {
		paths['p' + c++] = [x * 6, y * 6];
	}
}
new Array(size).fill(null).forEach((_, i) => {
	const x = 6 * i;
	new Array(size).fill(null).forEach((_, i) => [x, 6 * i]);
});

const basicScheme: SchemeInterface = {
	paths
};
const basicAssociations = Object.keys(basicScheme.paths).reduce<{
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
	scheme: basicScheme,
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
