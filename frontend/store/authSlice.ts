import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserSummary, UserProfile } from '@/types/user';
import { LoginFormValues, RegisterFormValues, ProfileFormValues, ChangePasswordFormValues } from '@/schemas/authSchema';
import { authApi, tokenStorage } from '@/lib/api';

export interface AuthState {
  user: UserProfile | UserSummary | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  // Modals
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  isProfileModalOpen: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  isProfileModalOpen: false,
};

// Async Thunks
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const _token = tokenStorage.getAccessToken();
      // Even if no localStorage token, cookies might be present
      return await authApi.getMe();
    } catch (err: any) {
      tokenStorage.clearTokens();
      return rejectWithValue(err.response?.data?.detail || 'Not authenticated');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginFormValues, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response.user;
    } catch (err: any) {
      const detail =
        err.response?.data?.detail ||
        (err.response?.data?.non_field_errors && err.response.data.non_field_errors[0]) ||
        'Invalid email or password';
      return rejectWithValue(detail);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterFormValues, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      return response.user;
    } catch (err: any) {
      const errorData = err.response?.data;
      let message = 'Registration failed';
      if (errorData) {
        if (typeof errorData === 'string') message = errorData;
        else if (errorData.email) message = errorData.email[0];
        else if (errorData.detail) message = errorData.detail;
        else message = JSON.stringify(errorData);
      }
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  await authApi.logout();
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: ProfileFormValues, { rejectWithValue }) => {
    try {
      return await authApi.updateProfile(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (data: ChangePasswordFormValues, { rejectWithValue }) => {
    try {
      return await authApi.changePassword(data);
    } catch (err: any) {
      const errorData = err.response?.data;
      let message = 'Failed to change password';
      if (errorData?.old_password) message = errorData.old_password[0];
      else if (errorData?.new_password) message = errorData.new_password[0];
      else if (errorData?.detail) message = errorData.detail;
      return rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (state, action: PayloadAction<'login' | 'register'>) => {
      state.isAuthModalOpen = true;
      state.authModalMode = action.payload;
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
    },
    openProfileModal: (state) => {
      state.isProfileModalOpen = true;
    },
    closeProfileModal: (state) => {
      state.isProfileModalOpen = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAuth
      .addCase(checkAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.status = 'failed';
        state.user = null;
        state.isAuthenticated = false;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAuthModalOpen = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'idle';
      })

      // updateProfile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  openProfileModal,
  closeProfileModal,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
