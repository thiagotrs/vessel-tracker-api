import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import Vessel from '@/tracking/domain/Vessel'

export default class VesselRepositoryInMem implements IVesselRepository {
  private _vessels: Vessel[]

  get vessels(): Vessel[] {
    return this._vessels
  }

  constructor(vessels: Vessel[]) {
    this._vessels = vessels
  }

  public reset(vessels: Vessel[]) {
    this._vessels = vessels
  }

  async findAll(): Promise<Vessel[]> {
    return this._vessels
  }

  async find(id: string): Promise<Vessel | null> {
    return this._vessels.find((vessel) => vessel.id === id) || null
  }

  async delete(vessel: Vessel): Promise<void> {
    const vesselResult: Vessel | undefined = this._vessels.find(
      (p) => p.id === vessel.id
    )

    if (!vesselResult) {
      throw new Error('Invalid Operation.')
    }

    this._vessels = this._vessels.filter((p) => p.id === vessel.id)
  }

  async save(vessel: Vessel): Promise<void> {
    const vesselResultIndex = this._vessels.findIndex((p) => p.id === vessel.id)

    if (vesselResultIndex >= 0) {
      this._vessels[vesselResultIndex] = vessel
    } else {
      this._vessels = [...this._vessels, vessel]
    }
  }
}
