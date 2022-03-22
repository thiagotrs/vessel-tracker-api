import { PayloadDto } from '../dto/PayloadDto'
import TokenDto from '../dto/TokenDto'

export default interface IAuthenticator {
  verify(token: string): Promise<PayloadDto>

  generate(payload: PayloadDto): Promise<TokenDto>
}
