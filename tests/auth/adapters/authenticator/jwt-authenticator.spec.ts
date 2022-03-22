import JwtAuthenticator from '@/auth/adapters/authenticator/JwtAuthenticator'
import jwt from 'jsonwebtoken'

// jest.mock('jsonwebtoken', () => ({
//   sign: jest.fn().mockImplementation(() => 'valid-token'),
//   verify: jest.fn().mockImplementation(() => 'valid-token')
// }))

const jwtSpySign = jest.spyOn(jwt, 'sign')
const jwtSpyVerify = jest.spyOn(jwt, 'verify')

const SECRET = 'SECRET_TEST'
const EXPIRES_IN = 1000

describe('JwtAuthenticator', () => {
  it('should authenticate', async () => {
    const authenticator = new JwtAuthenticator(SECRET, EXPIRES_IN)
    const payload = {
      name: 'John Doe',
      email: 'john@doe.com'
    }

    const token = await authenticator.generate(payload)

    expect(token).not.toBeNull()
    expect(token).toHaveProperty('token')
    expect(token.token).not.toBeUndefined()
    expect(typeof token.token).toBe('string')
    expect(jwt.sign).toHaveBeenCalled()
    expect(jwtSpySign).toBeCalled()
  })

  it('should verify token', async () => {
    const authenticator = new JwtAuthenticator(SECRET, EXPIRES_IN)
    const payload = {
      name: 'John Doe',
      email: 'john@doe.com'
    }
    const validToken = 'valid-token'
    jwtSpyVerify.mockImplementation(() => ({ payload }))

    const payloadToken = await authenticator.verify(validToken)

    expect(payloadToken).toStrictEqual(payload)
    expect(jwt.verify).toHaveBeenCalled()
    expect(jwtSpyVerify).toBeCalled()

    jwtSpyVerify.mockReset()
  })

  it('should not verify token', async () => {
    const authenticator = new JwtAuthenticator(SECRET, EXPIRES_IN)
    const invalidToken = 'invalid-token'

    await expect(authenticator.verify(invalidToken)).rejects.toThrow()
    expect(jwt.verify).toHaveBeenCalled()
    expect(jwtSpyVerify).toBeCalled()
  })
})
