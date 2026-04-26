import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string; email: string; role?: string; phone?: string; [key: string]: any } | null;
}

const initialState: AuthState = {
  isLoggedIn: false, 
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state: AuthState, action: PayloadAction<{ name: string; email: string }>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state: AuthState) => {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;