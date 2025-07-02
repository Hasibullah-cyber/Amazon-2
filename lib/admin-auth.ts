import { executeQuery } from './database'
import bcrypt from 'bcryptjs'

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
}

// Initialize default admin user if none exists
export async function initializeDefaultAdmin() {
  try {
    const result = await executeQuery('SELECT COUNT(*) as count FROM admin_users')
    const adminCount = parseInt(result.rows[0].count)

    if (adminCount === 0) {
      const defaultPassword = 'admin123' // Change this in production
      const hashedPassword = await bcrypt.hash(defaultPassword, 10)

      await executeQuery(`
        INSERT INTO admin_users (username, email, password_hash, role, is_active)
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin', 'admin@hasibshop.com', hashedPassword, 'admin', true])

      console.log('Default admin user created: admin/admin123')
    }
  } catch (error) {
    console.error('Error initializing default admin:', error)
  }
}

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
  private readonly ADMIN_CREDENTIALS = {
    username: 'admin_hasib',
    password: 'hasib334'
  }

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
      if (username === this.ADMIN_CREDENTIALS.username && password === this.ADMIN_CREDENTIALS.password) {
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
        return { success: false, error: 'Invalid admin credentials' }
      }
    } catch (error) {
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