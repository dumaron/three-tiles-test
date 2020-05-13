import { combineReducers } from '@reduxjs/toolkit';
import { schemeEditorSlice } from './slices/editor';

export const rootReducer = combineReducers({
	editor: schemeEditorSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
