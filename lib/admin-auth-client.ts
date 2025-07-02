
export interface AdminUser {
  username: string
  password: string
  role: 'admin'
}

export interface AdminAuthState {
  admin: AdminUser | null
  isAdminAuthenticated: boolean
}

class AdminAuthManager {
  private listeners: Array<(state: AdminAuthState) => void> = []
  private currentAdmin: AdminUser | null = null

  constructor() {
    this.loadAdminFromStorage()
  }

  private loadAdminFromStorage() {
    if (typeof window !== 'undefined') {
      const adminData = localStorage.getItem('hasib_shop_admin')
      if (adminData) {
        this.currentAdmin = JSON.parse(adminData)
      }
    }
  }

  private saveAdminToStorage(admin: AdminUser) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hasib_shop_admin', JSON.stringify(admin))
    }
  }

  private removeAdminFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hasib_shop_admin')
    }
  }

  private notifyListeners() {
    const state: AdminAuthState = {
      admin: this.currentAdmin,
      isAdminAuthenticated: !!this.currentAdmin
    }
    this.listeners.forEach(listener => listener(state))
  }

  subscribe(listener: (state: AdminAuthState) => void) {
    this.listeners.push(listener)
    listener({
      admin: this.currentAdmin,
      isAdminAuthenticated: !!this.currentAdmin
    })

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  async adminSignIn(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Call the API route for authentication
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (result.success) {
        const adminUser: AdminUser = {
          username,
          password: '', // Don't store password
          role: 'admin'
        }

        this.currentAdmin = adminUser
        this.saveAdminToStorage(adminUser)
        this.notifyListeners()

        return { success: true }
      } else {
        return { success: false, error: result.error || 'Invalid admin credentials' }
      }
    } catch (error) {
      console.error('Admin sign in error:', error)
      return { success: false, error: 'Failed to sign in as admin' }
    }
  }

  adminSignOut() {
    this.currentAdmin = null
    this.removeAdminFromStorage()
    this.notifyListeners()
  }

  getCurrentAdmin(): AdminUser | null {
    return this.currentAdmin
  }

  getAdminAuthState(): AdminAuthState {
    return {
      admin: this.currentAdmin,
      isAdminAuthenticated: !!this.currentAdmin
    }
  }
}

export const adminAuthManager = new AdminAuthManager()
