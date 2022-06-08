import { randomUUID } from 'crypto'
import IllegalOperationError from './errors/IllegalOperationError'

export default class Port {
  private constructor(
    private _id: string,
    private _name: string,
    private _capacity: number,
    private _country: string,
    private _city: string,
    private _coordinates: [number, number]
  ) {
    this.validate()
  }

  public static create(
    name: string,
    capacity: number,
    country: string,
    city: string,
    coordinates: [number, number]
  ): Port {
    const id = randomUUID()
    return new this(id, name, capacity, country, city, coordinates)
  }

  public static of(
    id: string,
    name: string,
    capacity: number,
    country: string,
    city: string,
    coordinates: [number, number]
  ): Port {
    return new this(id, name, capacity, country, city, coordinates)
  }

  public get id(): string {
    return this._id
  }

  public get name(): string {
    return this._name
  }

  public get capacity(): number {
    return this._capacity
  }

  public get country(): string {
    return this._country
  }

  public get city(): string {
    return this._city
  }

  public get coordinates(): [number, number] {
    return this._coordinates
  }

  private validate(): void {
    const isIdValid = this._id && this._id.length === 36
    const isNameValid = this._name && this._name.trim().length > 0
    const isCountryValid = this._country && this._country.trim().length > 0
    const isCityValid = this._city && this._city.trim().length > 0
    const isCapacityValid = this._capacity && this._capacity > 0
    const isCoordinatesValid =
      this._coordinates === null ||
      this._coordinates === undefined ||
      (this._coordinates[0] <= 90 &&
        this._coordinates[0] >= -90 &&
        this._coordinates[1] <= 180 &&
        this._coordinates[1] >= -180)

    if (
      !(
        isIdValid &&
        isNameValid &&
        isCountryValid &&
        isCityValid &&
        isCapacityValid &&
        isCoordinatesValid
      )
    ) {
      throw new IllegalOperationError('Invalid args')
    }
  }
}
