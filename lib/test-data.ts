
export const createTestUser = () => {
  if (typeof window !== 'undefined') {
    const testUser = {
      id: 'test-user-1',
      email: 'test@test.com',
      name: 'Test User',
      createdAt: new Date().toISOString(),
      orders: []
    }

    const existingUsers = localStorage.getItem('hasib_shop_users')
    const users = existingUsers ? JSON.parse(existingUsers) : []
    
    // Only add if doesn't exist
    if (!users.find((u: any) => u.email === 'test@test.com')) {
      users.push(testUser)
      localStorage.setItem('hasib_shop_users', JSON.stringify(users))
      console.log('Test user created: test@test.com / password: test123')
    }
  }
}

// Auto-create test user when this module loads
if (typeof window !== 'undefined') {
  setTimeout(createTestUser, 100)
}
