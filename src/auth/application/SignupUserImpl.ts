import User from '../domain/User'
import IAuthenticator from './port/IAuthenticator'
import ISignupUser from './port/ISignupUser'
import IUserRepository from './port/IUserRepository'
import TokenDto from './dto/TokenDto'
import IEncrypter from './port/IEncrypter'
import IllegalOperationError from '../../tracking/domain/errors/IllegalOperationError'

export default class SignupUserImpl implements ISignupUser {
  private readonly userRepository: IUserRepository
  private readonly authenticator: IAuthenticator
  private readonly encrypter: IEncrypter

  constructor(
    userRepository: IUserRepository,
    authenticator: IAuthenticator,
    encrypter: IEncrypter
  ) {
    this.userRepository = userRepository
    this.authenticator = authenticator
    this.encrypter = encrypter
  }

  async execute(name: string, email: string, pass: string): Promise<TokenDto> {
    const userResult = await this.userRepository.findByEmail(email)

    if (userResult !== null) {
      throw new IllegalOperationError('User is already exists')
    }

    const passHashed = await this.encrypter.hash(pass)

    const user = User.create(name, email, pass, passHashed)

    const token = await this.authenticator.generate({
      name: user.name,
      email: user.email
    })

    await this.userRepository.save(user)

    return token
  }
}
