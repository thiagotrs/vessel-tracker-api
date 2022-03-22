import UserRepositoryInMem from '@/auth/adapters/repositories/UserRepositoryInMem'
import User from '@/auth/domain/User'

const fakeUser = (): User => {
  const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'John Doe'
  const email = 'johndoe@email.com'
  const pass = 'admin1234'

  return User.of(id, name, email, pass)
}

describe('UserRepositoryInMem', () => {
  it('should repository add user on save', async () => {
    const expectedResult = fakeUser()
    const userRepository = new UserRepositoryInMem([])

    await userRepository.save(expectedResult)

    expect(userRepository.users).toHaveLength(1)
    expect(userRepository.users).toContain(expectedResult)
  })

  it('should repository update user on save', async () => {
    const expectedResult = fakeUser()
    const userRepository = new UserRepositoryInMem([expectedResult])

    await userRepository.save(expectedResult)

    expect(userRepository.users).toHaveLength(1)
    expect(userRepository.users).toContain(expectedResult)
  })

  it('should repository find all users', async () => {
    const expectedResult = fakeUser()
    const userRepository = new UserRepositoryInMem([expectedResult])

    expect(userRepository.findAll()).resolves.toEqual(userRepository.users)
  })

  it('should repository find user by id', () => {
    const expectedResult = fakeUser()
    const userRepository = new UserRepositoryInMem([expectedResult])

    expect(userRepository.find(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
  })

  it('should repository not find user by id', () => {
    const invalidId = ''
    const userRepository = new UserRepositoryInMem([])

    expect(userRepository.find(invalidId)).resolves.toBeNull()
  })
})
