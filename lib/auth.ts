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
  loading?: boolean
}

class AuthManager {
  private listeners: Array<(state: AuthState) => void> = []
  private currentUser: User | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // Load user from localStorage on initialization
      this.loadUserFromStorage()
    }
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
      console.log('Attempting sign up for:', email)
      // Check if user already exists
      const existingUsers = this.getAllUsers()
      console.log('Existing users:', existingUsers.length)
      
      if (existingUsers.find(u => u.email === email)) {
        console.log('Email already exists')
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

      console.log('Creating new user:', newUser)

      // Save to users list
      const users = [...existingUsers, newUser]
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasib_shop_users', JSON.stringify(users))
        console.log('Saved users to localStorage')
      }

      // Sign in the user
      this.currentUser = newUser
      this.saveUserToStorage(newUser)
      this.notifyListeners()

      console.log('User signed up and signed in successfully')
      return { success: true }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'Failed to create account' }
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Attempting sign in for:', email)
      const users = this.getAllUsers()
      console.log('Available users:', users.length)
      const user = users.find(u => u.email === email)

      if (!user) {
        console.log('User not found')
        return { success: false, error: 'Invalid email or password' }
      }

      console.log('User found, signing in...')
      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll just sign them in
      this.currentUser = user
      this.saveUserToStorage(user)
      this.notifyListeners()

      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
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