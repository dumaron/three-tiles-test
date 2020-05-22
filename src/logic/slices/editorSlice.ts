import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EditorState {
	selectedPath: string | null;
}

const initialState: EditorState = {
	selectedPath: null,
};

export const editorSlice = createSlice({
	name: 'editor',
	initialState,
	reducers: {
		selectPath(state, action: PayloadAction<string>) {
			if (state.selectedPath === null) {
				state.selectedPath = action.payload;
			}
		},
		deselectPath(state) {
			state.selectedPath = null;
		},
	},
});

export const { selectPath, deselectPath } = editorSlice.actions;
