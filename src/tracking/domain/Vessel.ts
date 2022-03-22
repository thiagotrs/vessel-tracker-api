import { randomUUID } from 'crypto'
import IllegalOperationError from './errors/IllegalOperationError'
import Stop from './Stop'

export enum VesselStatus {
  SAILING = 'Sailing',
  PARKED = 'Parked'
}

export default class Vessel {
  private constructor(
    private _id: string,
    private _name: string,
    private _ownership: string,
    private _status: VesselStatus,
    private _year: number,
    private _currentStop: Stop | null,
    private _previousStops: Stop[],
    private _nextStops: Stop[]
  ) {
    this.validate()
  }

  public static create(
    name: string,
    ownership: string,
    year: number,
    portId: string
  ): Vessel {
    if (portId.length !== 36) throw new IllegalOperationError('Invalid args')

    const id = randomUUID()
    const status = VesselStatus.PARKED
    const currentStop = Stop.create(portId)
    currentStop.registerDateIn()
    const previousStops: Stop[] = []
    const nextStops: Stop[] = []

    return new this(
      id,
      name,
      ownership,
      status,
      year,
      currentStop,
      previousStops,
      nextStops
    )
  }

  public static of(
    id: string,
    name: string,
    ownership: string,
    status: VesselStatus,
    year: number,
    currentStop: Stop | null,
    previousStops: Stop[],
    nextStops: Stop[]
  ): Vessel {
    return new this(
      id,
      name,
      ownership,
      status,
      year,
      currentStop,
      previousStops,
      nextStops
    )
  }

  public dock(): void {
    if (this._status === VesselStatus.PARKED) {
      throw new IllegalOperationError('Vessel is already Parked.') // InvalidOperation
    }

    if (!this._nextStops.length) {
      throw new IllegalOperationError('There is not next stop.') // InvalidOperation
    }

    this._status = VesselStatus.PARKED

    const currentStop = this._nextStops[0]
    currentStop.registerDateIn()

    this._nextStops = this._nextStops.slice(1)
    this._currentStop = currentStop
  }

  public undock(): void {
    if (this._status === VesselStatus.SAILING) {
      throw new IllegalOperationError('Vessel is already Sailing.') // InvalidOperation
    }

    this._status = VesselStatus.SAILING

    const lastStop = this._currentStop as Stop
    lastStop.registerDateOut()

    this._previousStops = [...this._previousStops, lastStop]
    this._currentStop = null
  }

  public replaceAllNextStops(stops: Stop[]): void {
    if (stops.length !== 0) {
      const portId =
        this._currentStop?.portId ||
        this._previousStops[this._previousStops.length - 1].portId

      if (portId === stops[0].portId) {
        throw new IllegalOperationError('Next stops must not be same port') // InvalidOperation
      }

      const areAllDifferentPorts = stops
        .slice(1)
        .every((stop, idx) => stop.portId !== stops[idx].portId)

      if (!areAllDifferentPorts) {
        throw new IllegalOperationError('Next stops must not be same port') // InvalidOperation
      }
    }

    this._nextStops = stops
  }

  public get nextStops(): Stop[] {
    return this._nextStops
  }

  public get previousStops(): Stop[] {
    return this._previousStops
  }

  public get currentStop(): Stop | null {
    return this._currentStop
  }

  public get year(): number {
    return this._year
  }

  public get status(): VesselStatus {
    return this._status
  }

  public get ownership(): string {
    return this._ownership
  }

  public get name(): string {
    return this._name
  }

  public get id(): string {
    return this._id
  }

  private validate(): void {
    const isIdValid = this._id && this._id.length === 36
    const isNameValid = this._name && this._name.trim().length > 0
    const isOwnershipValid =
      this._ownership && this._ownership.trim().length > 0
    const isYearValid = this._year && this._year >= 1900

    if (!(isIdValid && isNameValid && isOwnershipValid && isYearValid)) {
      throw new IllegalOperationError('Invalid args')
    }

    if (this._currentStop === null && this._previousStops.length === 0) {
      throw new IllegalOperationError(
        'Vessel must have at least one current or previous stop'
      )
    }
  }
}
