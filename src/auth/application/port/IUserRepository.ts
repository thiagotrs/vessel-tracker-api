import User from '../../domain/User'

export default interface IUserRepository {
  findAll(): Promise<User[]>

  find(id: string): Promise<User | null>

  findByEmail(email: string): Promise<User | null>

  delete(user: User): Promise<void>

  save(user: User): Promise<void>
}
