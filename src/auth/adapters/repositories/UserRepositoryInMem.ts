import IUserRepository from '@/auth/application/port/IUserRepository'
import User from '@/auth/domain/User'

export default class UserRepositoryInMem implements IUserRepository {
  private _users: User[]

  get users(): User[] {
    return this._users
  }

  constructor(users: User[]) {
    this._users = users
  }

  async findAll(): Promise<User[]> {
    return this._users
  }

  async find(id: string): Promise<User | null> {
    return this._users.find((user) => user.id === id) || null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this._users.find((user) => user.email === email) || null
  }

  async delete(user: User): Promise<void> {
    const userResult: User | undefined = this._users.find(
      (p) => p.id === user.id
    )

    if (!userResult) {
      throw new Error('Method not implemented.')
    }

    this._users = this._users.filter((p) => p.id === user.id)
  }

  async save(user: User): Promise<void> {
    const userResultIndex = this._users.findIndex((p) => p.id === user.id)

    if (userResultIndex >= 0) {
      this._users[userResultIndex] = user
    } else {
      this._users = [...this._users, user]
    }
  }
}
