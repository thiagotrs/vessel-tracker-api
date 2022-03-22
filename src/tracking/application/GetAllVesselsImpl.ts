import Vessel from '../domain/Vessel'
import IGetAllVessels from './port/IGetAllVessels'
import IVesselRepository from './port/IVesselRepository'

export default class GetAllVesselsImpl implements IGetAllVessels {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(): Promise<Vessel[]> {
    return await this.vesselRepository.findAll()
  }
}
