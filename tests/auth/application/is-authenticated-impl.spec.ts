import { PayloadDto } from '@/auth/application/dto/PayloadDto'
import IsAuthenticatedImpl from '@/auth/application/IsAuthenticatedImpl'
import IAuthenticator from '@/auth/application/port/IAuthenticator'

const makeMockAuthenticator = (
  verifyFn?: (token: string) => Promise<PayloadDto>
) =>
  jest.fn<IAuthenticator, any[]>(() => ({
    verify: jest.fn(verifyFn),
    generate: jest.fn()
  }))

const makeSUT = (verifyFn?: (token: string) => Promise<PayloadDto>) => {
  const MockAuthenticator = makeMockAuthenticator(verifyFn)
  const mockedAuthenticator = new MockAuthenticator()
  const isAuthenticated = new IsAuthenticatedImpl(mockedAuthenticator)
  return { mockedAuthenticator, isAuthenticated }
}

describe('IsAuthenticatedImpl', () => {
  it('should be authenticated', async () => {
    const payload = {
      name: 'John Doe',
      email: 'john@doe.com'
    }
    const { mockedAuthenticator, isAuthenticated } = makeSUT(() =>
      Promise.resolve(payload)
    )

    const payloadToken = await isAuthenticated.execute('valid-token')

    expect(payloadToken).toBe(payload)
    expect(mockedAuthenticator.verify).toBeCalledTimes(1)
  })

  it('should not be authenticated when invalid token', async () => {
    const { mockedAuthenticator, isAuthenticated } = makeSUT(() =>
      Promise.reject(new Error('JsonWebTokenError'))
    )

    await expect(isAuthenticated.execute('invalid-token')).rejects.toThrow()
    expect(mockedAuthenticator.verify).toBeCalledTimes(1)
    await expect(mockedAuthenticator.verify).rejects.toThrow()
  })

  it('should not be authenticated when authenticator throws error', async () => {
    const { mockedAuthenticator, isAuthenticated } = makeSUT(() =>
      Promise.reject(new Error('TokenExpiredError'))
    )

    await expect(isAuthenticated.execute('token')).rejects.toThrow()
    expect(mockedAuthenticator.verify).toBeCalledTimes(1)
    await expect(mockedAuthenticator.verify).rejects.toThrow()
  })
})
