import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Hoist the mock
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))



import { authorizeUser } from '../auth'

describe('NextAuth Credentials Provider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null if identifier or password are missing', async () => {
    const result = await authorizeUser({ identifier: '', password: '' })
    expect(result).toBeNull()
  })

  it('should return null if user is not found', async () => {
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    const result = await authorizeUser({ identifier: 'test@example.com', password: 'password' })
    expect(result).toBeNull()
  })

  it('should return user object if credentials are correct', async () => {
    const user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: bcrypt.hashSync('correct_password', 10),
      role: 'USER',
      avatar: null,
      banner: null,
      emailVerified: new Date(),
    }
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(user)


    const result = await authorizeUser({ identifier: 'test@example.com', password: 'correct_password' })
    
    expect(result).toEqual({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar: user.avatar,
      banner: user.banner,
    })
  })

  it('should throw EMAIL_NOT_VERIFIED if email is not verified', async () => {
    process.env.RESEND_API_KEY = 'test_key'
    
    const user = {
      id: '1',
      email: 'test@example.com',
      password: bcrypt.hashSync('password', 10),
      username: 'test',
      role: 'USER',
      emailVerified: null,
      verificationToken: 'token',
    }
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(user)


    // Note: We might need to re-require auth if emailProviderConfigured is top-level
    // but let's see if this works.
    await expect(authorizeUser({ identifier: 'test@example.com', password: 'password' }))
      .rejects.toThrow('EMAIL_NOT_VERIFIED')
      
    delete process.env.RESEND_API_KEY
  })
})
