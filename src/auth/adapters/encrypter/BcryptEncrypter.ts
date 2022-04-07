import IEncrypter from '../../application/port/IEncrypter'
import bcrypt from 'bcrypt'

export default class BcryptEncrypter implements IEncrypter {
  async hash(value: string): Promise<string> {
    return bcrypt.hashSync(value, 10)
  }

  async compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compareSync(value, hash)
  }
}
