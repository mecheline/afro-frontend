// src/services/authSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthState {
  token: string | null;
  role: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar?: string | null;
}
export interface ProfileState {
  firstName: string | null;
  lastName: string | null;
  avatar?: string | null;
}

const initialState: AuthState | ProfileState = {
  token: null,
  role: null,
  email: null,
  firstName: null,
  lastName: null,
  avatar: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    Login(state, action: PayloadAction<AuthState>) {
      state.token = action.payload.token;
      state.role = action.payload.role;
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.avatar = action.payload.avatar;
    },
    Profile(state, action: PayloadAction<ProfileState>) {
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.avatar = action.payload.avatar;
    },
    
    Logout(state) {
      state.token = null;
    },
  },
});

export const { Login, Logout, Profile } = authSlice.actions;
export default authSlice.reducer;
