import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  id: string
  email: string
  name: string
  roles: string[]
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setUser: (user: User | null) => void
  isAdmin: () => boolean
}

import { API_ENDPOINTS } from '@/lib/env-config'

// Configure axios to always send cookies
axios.defaults.withCredentials = true

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true })
        try {
          const response = await axios.post(
            API_ENDPOINTS.AUTH.LOGIN,
            { email, password },
            {
              withCredentials: true,
              params: { 'remember-me': rememberMe ? 'true' : 'false' }
            }
          )

          const { user } = response.data
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true })
        try {
          const response = await axios.post(
            API_ENDPOINTS.AUTH.REGISTER,
            { email, password, name },
            { withCredentials: true }
          )

          const { user } = response.data
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await axios.post(
            API_ENDPOINTS.AUTH.LOGOUT,
            {},
            { withCredentials: true }
          )
        } finally {
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },

      checkSession: async () => {
        set({ isLoading: true })
        try {
          const response = await axios.get(
            API_ENDPOINTS.AUTH.ME,
            { withCredentials: true }
          )

          const { user } = response.data
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error: any) {
          // Only logout if it's an authentication error (401, 403)
          // Keep session if it's a network error (no response from server)
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Server says user is not authenticated
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            })
          } else {
            // Network error or other error - keep current auth state
            // Just set loading to false
            set({ isLoading: false })
          }
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      isAdmin: () => {
        const user = get().user
        return user?.roles?.includes('ADMIN') || false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
