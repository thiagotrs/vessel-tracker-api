import { PayloadDto } from '../dto/PayloadDto'

export default interface IIsAuthenticated {
  execute(token: string): Promise<PayloadDto>
}
