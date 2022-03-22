import { PayloadDto } from '@/auth/application/dto/PayloadDto'
import TokenDto from '@/auth/application/dto/TokenDto'
import UnauthorizedError from '@/auth/application/errors/UnauthorizedError'
import IAuthenticator from '@/auth/application/port/IAuthenticator'
import jwt, { JwtPayload } from 'jsonwebtoken'

export default class JwtAuthenticator implements IAuthenticator {
  private readonly SECRET: string
  private readonly EXPIRES_IN: number

  constructor(secret: string, expiresIn: number) {
    this.SECRET = secret
    this.EXPIRES_IN = expiresIn
  }

  async verify(token: string): Promise<PayloadDto> {
    // iss, sub, aud, exp, nbf, iat
    try {
      const { payload } = jwt.verify(token, this.SECRET) as JwtPayload
      return payload as PayloadDto
    } catch (error) {
      throw new UnauthorizedError()
    }
  }

  async generate(payload: PayloadDto): Promise<TokenDto> {
    return {
      token: jwt.sign({ payload }, this.SECRET, { expiresIn: this.EXPIRES_IN })
    }
  }
}
