import TokenDto from '../dto/TokenDto'

export default interface ISignupUser {
  execute(name: string, email: string, pass: string): Promise<TokenDto>
}
