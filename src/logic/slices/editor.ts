import { SchemeInterface } from '../../types/schema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SchemeEditorState {
	selectedPath: string | null;
	scheme: SchemeInterface;
}

const basicScheme: SchemeInterface = {
	paths: {
		p0: [0, 0],
		p1: [0, 6],
		p2: [6, 0],
		p3: [6, 6],
	},
};

const initialState: SchemeEditorState = {
	scheme: basicScheme,
	selectedPath: null,
};

export const schemeEditorSlice = createSlice({
	name: 'loadedScheme',
	initialState,
	reducers: {
		selectPath(state, action: PayloadAction<string>) {
			state.selectedPath = action.payload;
		},
		deselectPath(state) {
			state.selectedPath = null;
		},
	},
});

export const { actions } = schemeEditorSlice;
