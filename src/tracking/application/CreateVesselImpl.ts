import Vessel from '../domain/Vessel'
import ICreateVessel from './port/ICreateVessel'
import IVesselRepository from './port/IVesselRepository'

export default class CreateVesselImpl implements ICreateVessel {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(
    name: string,
    ownership: string,
    year: number,
    portId: string
  ): Promise<void> {
    const vessel = Vessel.create(name, ownership, year, portId)

    await this.vesselRepository.save(vessel)
  }
}
