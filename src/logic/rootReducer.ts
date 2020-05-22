import { combineReducers } from '@reduxjs/toolkit';
import { loadedSchemeSlice } from './slices/loadedSchemeSlice';
import { editorSlice } from './slices/editorSlice';

export const rootReducer = combineReducers({
	loadedScheme: loadedSchemeSlice.reducer,
	editor: editorSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
