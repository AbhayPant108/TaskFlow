import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserSummary, UserFilterParams } from '@/types/user';
import { userApi } from '@/lib/api';

export interface UserState {
  items: UserSummary[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  search: string;
  roleFilter: string;
}

const initialState: UserState = {
  items: [],
  status: 'idle',
  error: null,
  search: '',
  roleFilter: 'ALL',
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { users: UserState };
      const { search, roleFilter } = state.users;
      const params: UserFilterParams = {
        search: search || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      };
      return await userApi.getUsers(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch users');
    }
  }
);

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUserSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setUserRoleFilter: (state, action: PayloadAction<string>) => {
      state.roleFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setUserSearch, setUserRoleFilter } = userSlice.actions;

export default userSlice.reducer;
