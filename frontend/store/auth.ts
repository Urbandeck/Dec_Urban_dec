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
  _hasHydrated: boolean

  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  setUser: (user: User | null) => void
  isAdmin: () => boolean
  setHasHydrated: (state: boolean) => void
}

import { API_ENDPOINTS } from '@/lib/env-config'

// Configure axios to always send cookies
axios.defaults.withCredentials = true

// Flag to prevent multiple simultaneous logouts
let isLoggingOut = false

// Setup axios interceptor to handle 401/403 responses globally
// Only for protected API calls (not auth endpoints)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url || ''

    // Skip auth-related endpoints - these handle their own auth flow
    const isAuthEndpoint = url.includes('/auth/login') ||
                           url.includes('/auth/register') ||
                           url.includes('/auth/me') ||
                           url.includes('/auth/logout')

    // Only clear auth state for protected API calls that return 401/403
    // This indicates the session is truly invalid (not just a failed login attempt)
    if ((status === 401 || status === 403) && !isLoggingOut && !isAuthEndpoint) {
      console.log('Protected API returned 401/403, session may be invalid')
      // Don't auto-redirect, let the checkSession handle it properly
      // Just log for debugging
    }
    return Promise.reject(error)
  }
)

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state })
      },

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
        const currentState = get()
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
          set({ isLoading: false })

          // Check if it's a 401/403 error - this means session is invalid or user deleted
          const status = error?.response?.status
          if (status === 401 || status === 403) {
            // Session/user is invalid - clear auth state
            console.log('Session invalid (401/403), clearing auth state')
            set({
              user: null,
              isAuthenticated: false,
            })
            return
          }

          // For other errors (network issues, 500 errors), keep existing state
          // This prevents logout on temporary network issues or server restarts
          if (!currentState.user && !currentState.isAuthenticated) {
            set({
              user: null,
              isAuthenticated: false,
            })
          }
          // Otherwise keep the existing auth state from localStorage
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
