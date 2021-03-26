import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EditorState {
	selectedPath: string | null
	hoveringFreeImage: boolean
}

const initialState: EditorState = {
	selectedPath: null,
	hoveringFreeImage: false
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
		setHoveringFreeImage(state, action: PayloadAction<boolean>) {
			state.hoveringFreeImage = action.payload
		},
	},
});

export const { selectPath, deselectPath, setHoveringFreeImage } = editorSlice.actions;
