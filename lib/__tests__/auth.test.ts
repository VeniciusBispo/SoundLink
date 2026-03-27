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

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

describe('NextAuth Credentials Provider', () => {
  let authorize: any

  beforeAll(() => {
    // Import here to ensure it uses the mocked prisma
    const { authOptions } = require('../auth')
    authorize = authOptions.providers.find((p: any) => p.id === 'credentials')?.authorize
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null if identifier or password are missing', async () => {
    const result = await authorize({ identifier: '', password: '' }, {})
    expect(result).toBeNull()
  })

  it('should return null if user is not found', async () => {
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(null)
    const result = await authorize({ identifier: 'test@example.com', password: 'password' }, {})
    expect(result).toBeNull()
  })

  it('should return user object if credentials are correct', async () => {
    const user = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashed_password',
      role: 'USER',
      avatar: null,
      banner: null,
      emailVerified: new Date(),
    }
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(user)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const result = await authorize({ identifier: 'test@example.com', password: 'correct_password' }, {})
    
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
      password: 'hashed_password',
      username: 'test',
      role: 'USER',
      emailVerified: null,
      verificationToken: 'token',
    }
    ;(prisma.user.findFirst as jest.Mock).mockResolvedValue(user)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    // Note: We might need to re-require auth if emailProviderConfigured is top-level
    // but let's see if this works.
    await expect(authorize({ identifier: 'test@example.com', password: 'password' }, {}))
      .rejects.toThrow('EMAIL_NOT_VERIFIED')
      
    delete process.env.RESEND_API_KEY
  })
})
