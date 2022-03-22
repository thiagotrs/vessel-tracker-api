import { randomUUID } from 'crypto'
import IllegalOperationError from './errors/IllegalOperationError'

export default class Stop {
  private constructor(
    private _id: string,
    private _portId: string,
    private _dateIn: Date | null,
    private _dateOut: Date | null
  ) {
    this.validate()
  }

  public static create(portId: string): Stop {
    const id = randomUUID()

    return new this(id, portId, null, null)
  }

  public static of(
    id: string,
    portId: string,
    dateIn: Date | null,
    dateOut: Date | null
  ): Stop {
    return new this(id, portId, dateIn, dateOut)
  }

  public registerDateIn(): void {
    if (this._dateOut !== null) {
      throw new IllegalOperationError(
        'dateIn can not be registered after dateOut.'
      ) // InvalidOperations
    }

    this._dateIn = new Date()
  }

  public registerDateOut(): void {
    if (this._dateIn === null) {
      throw new IllegalOperationError('dateIn was not registered.') // InvalidOperations
    }

    this._dateOut = new Date()
  }

  public get dateOut(): Date | null {
    return this._dateOut
  }

  public get dateIn(): Date | null {
    return this._dateIn
  }

  public get portId(): string {
    return this._portId
  }

  public get id(): string {
    return this._id
  }

  private validate(): void {
    const isIdValid = this._id && this._id.length === 36
    const isPortIdValid = this._portId && this._portId.length === 36

    if (!(isIdValid && isPortIdValid)) {
      throw new IllegalOperationError('Invalid args')
    }

    if (this._dateIn === null && this._dateOut !== null) {
      throw new IllegalOperationError(
        'dateIn can not be registered after dateOut'
      )
    }

    if (
      this._dateOut !== null &&
      this._dateIn !== null &&
      this._dateOut?.getDate() < this._dateIn?.getDate()
    ) {
      throw new IllegalOperationError(
        'dateIn can not be registered after dateOut'
      )
    }
  }
}
