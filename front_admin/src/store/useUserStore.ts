import create from 'zustand'

interface UserState {
  token: string | null
  saveToken: (token: string) => void
  clearToken: () => void
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('token'),
  saveToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token })
  },
  clearToken: () => {
    localStorage.removeItem('token')
    set({ token: null })
  },
}))
