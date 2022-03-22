import TokenDto from '../dto/TokenDto'

export default interface ISigninUser {
  execute(email: string, pass: string): Promise<TokenDto>
}
