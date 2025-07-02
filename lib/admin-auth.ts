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

// Verify admin credentials against database
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      'SELECT password_hash FROM admin_users WHERE username = $1 AND is_active = true',
      [username]
    )

    if (result.rows.length === 0) {
      // Fallback to hardcoded credentials
      const ADMIN_CREDENTIALS = {
        username: 'admin_hasib',
        password: 'hasib334'
      }
      return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
    }

    const hashedPassword = result.rows[0].password_hash
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Error verifying admin credentials:', error)
    // Fallback to hardcoded credentials
    const ADMIN_CREDENTIALS = {
      username: 'admin_hasib',
      password: 'hasib334'
    }
    return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
  }
}