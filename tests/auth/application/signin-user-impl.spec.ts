import { PayloadDto } from '@/auth/application/dto/PayloadDto'
import TokenDto from '@/auth/application/dto/TokenDto'
import IAuthenticator from '@/auth/application/port/IAuthenticator'
import IEncrypter from '@/auth/application/port/IEncrypter'
import IUserRepository from '@/auth/application/port/IUserRepository'
import SigninUserImpl from '@/auth/application/SigninUserImpl'
import User from '@/auth/domain/User'

const makeMockUserRepository = (
  findByEmailFn?: (email: string) => Promise<User | null>
) =>
  jest.fn<IUserRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(),
    findByEmail: jest.fn(findByEmailFn),
    findAll: jest.fn(),
    delete: jest.fn()
  }))

const makeMockAuthenticator = (
  generateFn?: (payload: PayloadDto) => Promise<TokenDto>
) =>
  jest.fn<IAuthenticator, any[]>(() => ({
    verify: jest.fn(),
    generate: jest.fn(generateFn)
  }))

const makeMockEncrypter = (
  compareFn?: (value: string, hash: string) => Promise<boolean>
) =>
  jest.fn<IEncrypter, any[]>(() => ({
    hash: jest.fn(),
    compare: jest.fn(compareFn)
  }))

const makeSUT = (
  findByEmailFn?: (email: string) => Promise<User | null>,
  compareFn?: (value: string, hash: string) => Promise<boolean>,
  generateFn?: (payload: PayloadDto) => Promise<TokenDto>
) => {
  const MockUserRepository = makeMockUserRepository(findByEmailFn)
  const MockAuthenticator = makeMockAuthenticator(generateFn)
  const MockEncrypter = makeMockEncrypter(compareFn)
  const mockedUserRepository = new MockUserRepository()
  const mockedAuthenticator = new MockAuthenticator()
  const mockedEncrypter = new MockEncrypter()
  const signinUser = new SigninUserImpl(
    mockedUserRepository,
    mockedAuthenticator,
    mockedEncrypter
  )
  return {
    mockedUserRepository,
    mockedAuthenticator,
    mockedEncrypter,
    signinUser
  }
}

const fakeUser = () => {
  const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'John Doe'
  const email = 'johndoe@email.com'
  const pass = 'hashed-pass'

  return User.of(id, name, email, pass)
}

describe('SigninUserImpl', () => {
  it('should signin user', async () => {
    const expectedResult = fakeUser()
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signinUser
    } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve(true),
      () => Promise.resolve({ token: 'token' })
    )

    const token = await signinUser.execute(
      expectedResult.email,
      expectedResult.pass
    )

    expect(token).toEqual(token)
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.compare).toBeCalledTimes(1)
    expect(mockedAuthenticator.generate).toBeCalledTimes(1)
  })

  it('should not signin user when repository throw error', async () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signinUser
    } = makeSUT(() => Promise.reject(new Error('Repository Error')))

    const email = 'johndoe@email.com'
    const pass = 'admin1234'

    await expect(signinUser.execute(email, pass)).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    await expect(mockedUserRepository.findByEmail).rejects.toThrow()
    expect(mockedEncrypter.compare).not.toBeCalled()
    expect(mockedAuthenticator.generate).not.toBeCalled()
  })

  it('should not signin user when encrypter throw error', async () => {
    const expectedResult = fakeUser()
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signinUser
    } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.reject(new Error('Encrypter Error'))
    )

    await expect(
      signinUser.execute(expectedResult.email, expectedResult.pass)
    ).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    await expect(mockedEncrypter.compare).rejects.toThrow()
    expect(mockedAuthenticator.generate).not.toBeCalled()
  })

  it('should not signin user when authenticator throw error', async () => {
    const expectedResult = fakeUser()
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signinUser
    } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve(true),
      () => Promise.reject(new Error('Authenticator Error'))
    )

    await expect(
      signinUser.execute(expectedResult.email, expectedResult.pass)
    ).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.compare).toBeCalledTimes(1)
    await expect(mockedAuthenticator.generate).rejects.toThrow()
  })

  it('should not signin user when invalid email', async () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signinUser
    } = makeSUT(() => Promise.resolve(null))

    const invalidEmail = 'invalid-email'
    const pass = 'admin1234'

    await expect(signinUser.execute(invalidEmail, pass)).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.compare).not.toBeCalled()
    expect(mockedAuthenticator.generate).not.toBeCalled()
  })

  it('should not signin user when invalid pass', async () => {
    const expectedResult = fakeUser()
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signinUser
    } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve(false)
    )

    const invalidPass = 'invalid-pass'

    await expect(
      signinUser.execute(expectedResult.email, invalidPass)
    ).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.compare).toBeCalledTimes(1)
    expect(mockedAuthenticator.generate).not.toBeCalled()
  })
})
