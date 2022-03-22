import IUserRepository from '@/auth/application/port/IUserRepository'
import User from '@/auth/domain/User'
import { Connection } from 'typeorm'
import UserEntity from './entities/UserEntity'

export default class UserRepositoryTypeOrm implements IUserRepository {
  private readonly connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  async findAll(): Promise<User[]> {
    const userEntity = await this.connection.getRepository(UserEntity).find()
    return userEntity.map((userEntity) => this.toData(userEntity))
  }

  async find(id: string): Promise<User | null> {
    const userEntity = await this.connection
      .getRepository(UserEntity)
      .findOne(id)
    return userEntity ? this.toData(userEntity) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.connection
      .getRepository(UserEntity)
      .findOne({ email })
    return userEntity ? this.toData(userEntity) : null
  }

  async delete(user: User): Promise<void> {
    await this.connection.getRepository(UserEntity).delete(user.id)
  }

  async save(user: User): Promise<void> {
    const userEntity = new UserEntity()
    userEntity.id = user.id
    userEntity.name = user.name
    userEntity.email = user.email
    userEntity.pass = user.pass
    await this.connection.getRepository(UserEntity).save(userEntity)
  }

  private toData(userEntity: UserEntity): User {
    return User.of(
      userEntity.id,
      userEntity.name,
      userEntity.email,
      userEntity.pass
    )
  }
}
