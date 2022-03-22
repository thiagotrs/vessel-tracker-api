import BcryptEncrypter from '@/auth/adapters/encrypter/BcryptEncrypter'
import bcrypt from 'bcrypt'

const bcryptSpyHash = jest.spyOn(bcrypt, 'hashSync')
const bcryptSpyCompare = jest.spyOn(bcrypt, 'compareSync')

describe('BcryptEncrypter', () => {
  it('should hash pass', async () => {
    const encrypter = new BcryptEncrypter()
    const validPass = 'valid-pass'

    const hashedPass = await encrypter.hash(validPass)

    expect(hashedPass).toBeTruthy()
    expect(hashedPass).not.toBeUndefined()
    expect(typeof hashedPass).toBe('string')
    expect(bcrypt.hashSync).toHaveBeenCalled()
    expect(bcryptSpyHash).toBeCalled()
  })

  it('should compare pass and hash', async () => {
    const encrypter = new BcryptEncrypter()
    const validPass = 'valid-pass'
    const hashedPass =
      '$2b$10$u8cjDuIICvJvfcKehLUxIOd9zyOG.8PqlYfbM2vxRWBQfr5ZpPeaC'

    const isvalid = await encrypter.compare(validPass, hashedPass)

    expect(isvalid).toBeTruthy()
    expect(bcrypt.compareSync).toHaveBeenCalled()
    expect(bcryptSpyCompare).toBeCalled()
  })

  it('should not compare pass and hash', async () => {
    const encrypter = new BcryptEncrypter()
    const invalidPass = 'invalid-pass'
    const hashedPass =
      '$2b$10$u8cjDuIICvJvfcKehLUxIOd9zyOG.8PqlYfbM2vxRWBQfr5ZpPeaC'

    const isvalid = await encrypter.compare(invalidPass, hashedPass)

    expect(isvalid).toBeFalsy()
    expect(bcrypt.compareSync).toHaveBeenCalled()
    expect(bcryptSpyCompare).toBeCalled()
  })
})
