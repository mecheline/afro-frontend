import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";

// Import your auth slice


import { authSlice } from "../../slices/scholar/authSlice";
import { scholarApi } from "./api";

// Configure persistence for auth slice
const authPersistConfig = {
  key: "auth",
  storage: storageSession,
  // No need for whitelist when applying directly to the slice
};

// Apply persistence directly to the auth reducer
const persistedAuthReducer = persistReducer(
  authPersistConfig,
  authSlice.reducer
);

// Create the root reducer
const rootReducer = combineReducers({
  auth: persistedAuthReducer, // Use 'auth' as the key to match your slice name
  [scholarApi.reducerPath]: scholarApi.reducer,
});

// Create the store
export const store = configureStore({
  reducer: rootReducer, // Use the rootReducer directly
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(scholarApi.middleware),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
