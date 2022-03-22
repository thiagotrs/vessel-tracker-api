import User from '@/auth/domain/User'

describe('User', () => {
  it('should create user', () => {
    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'
    const passHashed = 'hashed-pass'

    const user = User.create(name, email, pass, passHashed)

    expect(user.id).not.toBeNull()
    expect(user.name).toEqual(name)
    expect(user.email).toEqual(email)
    expect(user.pass).toEqual(passHashed)
  })

  it('should load user', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const passHashed = 'hashed-pass'

    const user = User.of(id, name, email, passHashed)

    expect(user.id).toEqual(id)
    expect(user.name).toEqual(name)
    expect(user.email).toEqual(email)
    expect(user.pass).toEqual(passHashed)
  })

  it('should user has unique id on create', () => {
    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = 'admin1234'
    const passHashed = 'hashed-pass'

    const user1 = User.create(name, email, pass, passHashed)
    const user2 = User.create(name, email, pass, passHashed)

    expect(user1.id).not.toEqual(user2.id)
  })

  it('should not create user when invalid inputs', () => {
    const name = 'John Doe'
    const email = 'johndoe@email.com'
    const pass = ''
    const passHashed = ''

    expect(() => User.create(name, email, pass, passHashed)).toThrow()
  })
})
