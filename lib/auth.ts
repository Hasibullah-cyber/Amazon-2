
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  orders?: string[]
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthManager {
  private listeners: Array<(state: AuthState) => void> = []
  private currentUser: User | null = null

  constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage()
  }

  private loadUserFromStorage() {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('hasib_shop_user')
      if (userData) {
        this.currentUser = JSON.parse(userData)
      }
    }
  }

  private saveUserToStorage(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasib_shop_user', JSON.stringify(user))
    }
  }

  private removeUserFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasib_shop_user')
    }
  }

  private notifyListeners() {
    const state: AuthState = {
      user: this.currentUser,
      isAuthenticated: !!this.currentUser
    }
    this.listeners.forEach(listener => listener(state))
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    // Immediately call with current state
    listener({
      user: this.currentUser,
      isAuthenticated: !!this.currentUser
    })
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user already exists
      const existingUsers = this.getAllUsers()
      if (existingUsers.find(u => u.email === email)) {
        return { success: false, error: 'Email already registered' }
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        createdAt: new Date().toISOString(),
        orders: []
      }

      // Save to users list
      const users = [...existingUsers, newUser]
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasib_shop_users', JSON.stringify(users))
      }

      // Sign in the user
      this.currentUser = newUser
      this.saveUserToStorage(newUser)
      this.notifyListeners()

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to create account' }
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = this.getAllUsers()
      const user = users.find(u => u.email === email)

      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll just sign them in
      this.currentUser = user
      this.saveUserToStorage(user)
      this.notifyListeners()

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to sign in' }
    }
  }

  signOut() {
    this.currentUser = null
    this.removeUserFromStorage()
    this.notifyListeners()
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  private getAllUsers(): User[] {
    if (typeof window !== 'undefined') {
      const usersData = localStorage.getItem('hasib_shop_users')
      return usersData ? JSON.parse(usersData) : []
    }
    return []
  }

  getAuthState(): AuthState {
    return {
      user: this.currentUser,
      isAuthenticated: !!this.currentUser
    }
  }
}

export const authManager = new AuthManager()
