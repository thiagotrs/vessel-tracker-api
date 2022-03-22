import { PayloadDto } from './dto/PayloadDto'
import IAuthenticator from './port/IAuthenticator'
import IIsAuthenticated from './port/IIsAuthenticated'

export default class IsAuthenticatedImpl implements IIsAuthenticated {
  private readonly authenticator: IAuthenticator

  constructor(authenticator: IAuthenticator) {
    this.authenticator = authenticator
  }

  async execute(token: string): Promise<PayloadDto> {
    return await this.authenticator.verify(token)
  }
}
