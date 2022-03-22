import TokenDto from './dto/TokenDto'
import ForbiddenError from './errors/ForbiddenError'
import IAuthenticator from './port/IAuthenticator'
import IEncrypter from './port/IEncrypter'
import ISigninUser from './port/ISigninUser'
import IUserRepository from './port/IUserRepository'

export default class SigninUserImpl implements ISigninUser {
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

  async execute(email: string, pass: string): Promise<TokenDto> {
    const userResult = await this.userRepository.findByEmail(email)

    if (userResult === null) {
      throw new ForbiddenError('Invalid email and/or pass')
    }

    const isPassCorrect = await this.encrypter.compare(pass, userResult.pass)

    if (!isPassCorrect) {
      throw new ForbiddenError('Invalid email and/or pass')
    }

    const token = await this.authenticator.generate({
      name: userResult.name,
      email: userResult.email
    })

    return token
  }
}
