import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  checkAuth,
  loginUser,
  registerUser,
  logoutUser,
  openAuthModal,
  closeAuthModal,
  openProfileModal,
  closeProfileModal,
  updateProfile,
  changePassword,
} from '@/store/authSlice';
import { LoginFormValues, RegisterFormValues, ProfileFormValues, ChangePasswordFormValues } from '@/schemas/authSchema';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, status, error, isAuthModalOpen, authModalMode, isProfileModalOpen } =
    useAppSelector((state) => state.auth);

  // Check auth on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const login = useCallback(
    async (credentials: LoginFormValues) => {
      return await dispatch(loginUser(credentials)).unwrap();
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload: RegisterFormValues) => {
      return await dispatch(registerUser(payload)).unwrap();
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    return await dispatch(logoutUser()).unwrap();
  }, [dispatch]);

  const openAuth = useCallback(
    (mode: 'login' | 'register' = 'login') => {
      dispatch(openAuthModal(mode));
    },
    [dispatch]
  );

  const closeAuth = useCallback(() => {
    dispatch(closeAuthModal());
  }, [dispatch]);

  const openProfile = useCallback(() => {
    dispatch(openProfileModal());
  }, [dispatch]);

  const closeProfile = useCallback(() => {
    dispatch(closeProfileModal());
  }, [dispatch]);

  const editProfile = useCallback(
    async (data: ProfileFormValues) => {
      return await dispatch(updateProfile(data)).unwrap();
    },
    [dispatch]
  );

  const updatePassword = useCallback(
    async (data: ChangePasswordFormValues) => {
      return await dispatch(changePassword(data)).unwrap();
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    status,
    error,
    isAuthModalOpen,
    authModalMode,
    isProfileModalOpen,
    login,
    register,
    logout,
    openAuth,
    closeAuth,
    openProfile,
    closeProfile,
    editProfile,
    updatePassword,
  };
}
