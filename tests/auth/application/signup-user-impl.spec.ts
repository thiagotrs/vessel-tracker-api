import TokenDto from '@/auth/application/dto/TokenDto'
import IAuthenticator from '@/auth/application/port/IAuthenticator'
import IEncrypter from '@/auth/application/port/IEncrypter'
import IUserRepository from '@/auth/application/port/IUserRepository'
import SignupUserImpl from '@/auth/application/SignupUserImpl'
import User from '@/auth/domain/User'

const makeMockUserRepository = (
  findByEmailFn?: (email: string) => Promise<User | null>,
  saveFn?: (port: User) => Promise<void>
) =>
  jest.fn<IUserRepository, any[]>(() => ({
    save: jest.fn(saveFn),
    find: jest.fn(),
    findByEmail: jest.fn(findByEmailFn),
    findAll: jest.fn(),
    delete: jest.fn()
  }))

const makeMockAuthenticator = (
  generateFn?: (payload: any) => Promise<TokenDto>
) =>
  jest.fn<IAuthenticator, any[]>(() => ({
    verify: jest.fn(),
    generate: jest.fn(generateFn)
  }))

const makeMockEncrypter = (hashFn?: (value: string) => Promise<string>) =>
  jest.fn<IEncrypter, any[]>(() => ({
    hash: jest.fn(hashFn),
    compare: jest.fn()
  }))

const makeSUT = (
  findByEmailFn?: (email: string) => Promise<User | null>,
  hashFn?: (value: string) => Promise<string>,
  generateFn?: (payload: any) => Promise<TokenDto>,
  saveFn?: (port: User) => Promise<void>
) => {
  const MockUserRepository = makeMockUserRepository(findByEmailFn, saveFn)
  const MockAuthenticator = makeMockAuthenticator(generateFn)
  const MockEncrypter = makeMockEncrypter(hashFn)
  const mockedUserRepository = new MockUserRepository()
  const mockedAuthenticator = new MockAuthenticator()
  const mockedEncrypter = new MockEncrypter()
  const signupUser = new SignupUserImpl(
    mockedUserRepository,
    mockedAuthenticator,
    mockedEncrypter
  )
  return {
    mockedUserRepository,
    mockedAuthenticator,
    mockedEncrypter,
    signupUser
  }
}

const fakeUser = () => {
  const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'John Doe'
  const email = 'johndoe@email.com'
  const pass = 'admin1234'

  return User.of(id, name, email, pass)
}

describe('SignupUserImpl', () => {
  it('should signup user', async () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(
      () => Promise.resolve(null),
      () => Promise.resolve('hashed-pass'),
      () => Promise.resolve({ token: 'token' }),
      () => Promise.resolve()
    )

    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'

    const token = await signupUser.execute(name, email, pass)

    expect(token).toEqual(token)
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.hash).toBeCalledTimes(1)
    expect(mockedAuthenticator.generate).toBeCalledTimes(1)
    expect(mockedUserRepository.save).toBeCalledTimes(1)
  })

  it('should not signup user when repository (findByEmail) throw error', () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(() => Promise.reject(new Error('Repository Error')))

    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'

    expect(signupUser.execute(name, email, pass)).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedUserRepository.findByEmail).rejects.toThrow()
    expect(mockedEncrypter.hash).not.toBeCalled()
    expect(mockedAuthenticator.generate).not.toBeCalled()
    expect(mockedUserRepository.save).not.toBeCalled()
  })

  it('should not signup user when encrypter throw error', () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(
      () => Promise.resolve(null),
      () => Promise.reject(new Error('Encrypter Error'))
    )

    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'

    expect(signupUser.execute(name, email, pass)).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.hash).rejects.toThrow()
    expect(mockedAuthenticator.generate).not.toBeCalled()
    expect(mockedUserRepository.save).not.toBeCalled()
  })

  it('should not signup user when authenticator throw error', async () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(
      () => Promise.resolve(null),
      () => Promise.resolve('hashed-pass'),
      () => Promise.reject(new Error('Authenticator Error'))
    )

    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'

    await expect(signupUser.execute(name, email, pass)).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.hash).toBeCalledTimes(1)
    await expect(mockedAuthenticator.generate).rejects.toThrow(
      'Authenticator Error'
    )
    expect(mockedUserRepository.save).not.toBeCalled()
  })

  it('should not signup user when repository (save) throw error', async () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(
      () => Promise.resolve(null),
      () => Promise.resolve('hashed-pass'),
      () => Promise.resolve({ token: 'token' }),
      () => Promise.reject(new Error('Repository Error'))
    )

    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'

    await expect(signupUser.execute(name, email, pass)).rejects.toThrowError()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.hash).toBeCalledTimes(1)
    expect(mockedAuthenticator.generate).toBeCalledTimes(1)
    await expect(mockedUserRepository.save).rejects.toThrow()
  })

  it('should not signup user when is already exists', () => {
    const expectedResult = fakeUser()
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(() => Promise.resolve(expectedResult))

    expect(
      signupUser.execute(
        expectedResult.name,
        expectedResult.email,
        expectedResult.pass
      )
    ).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.hash).not.toBeCalled()
    expect(mockedAuthenticator.generate).not.toBeCalled()
    expect(mockedUserRepository.save).not.toBeCalled()
  })

  it('should not signup user when invalid inputs', async () => {
    const {
      mockedUserRepository,
      mockedAuthenticator,
      mockedEncrypter,
      signupUser
    } = makeSUT(
      () => Promise.resolve(null),
      () => Promise.resolve('hashed-pass')
    )

    const name = 'John Doe'
    const invalidEmail = ''
    const pass = 'admin1234'

    await expect(signupUser.execute(name, invalidEmail, pass)).rejects.toThrow()
    expect(mockedUserRepository.findByEmail).toBeCalledTimes(1)
    expect(mockedEncrypter.hash).toBeCalledTimes(1)
    expect(mockedAuthenticator.generate).not.toBeCalled()
    expect(mockedUserRepository.save).not.toBeCalled()
  })
})
