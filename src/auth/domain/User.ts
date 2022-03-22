import { randomUUID } from 'crypto'

export default class User {
  private constructor(
    private _id: string,
    private _name: string,
    private _email: string,
    private _pass: string
  ) {
    this.validate()
  }

  public static create(
    name: string,
    email: string,
    pass: string,
    passHashed: string
  ): User {
    const isPassValid = pass.trim().length > 6
    if (!isPassValid) {
      throw new Error('Invalid pass.')
    }
    const id = randomUUID()
    return new this(id, name, email, passHashed)
  }

  public static of(
    id: string,
    name: string,
    email: string,
    pass: string
  ): User {
    return new this(id, name, email, pass)
  }

  public get pass(): string {
    return this._pass
  }

  public get email(): string {
    return this._email
  }

  public get name(): string {
    return this._name
  }

  public get id(): string {
    return this._id
  }

  private validate(): void {
    const isIdValid = this._id.length === 36
    const isNameValid = this._name.trim().length > 0
    const reEmail = /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/i
    const isEmailValid = reEmail.test(this._email)
    const isPassValid = this._pass.trim().length > 6

    if (!(isIdValid && isNameValid && isEmailValid && isPassValid)) {
      throw new Error('Invalid args')
    }
  }
}
