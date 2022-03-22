import Vessel from '../domain/Vessel'
import NotFoundError from './errors/NotFoundError'
import IGetVesselById from './port/IGetVesselById'
import IVesselRepository from './port/IVesselRepository'

export default class GetVesselByIdImpl implements IGetVesselById {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(id: string): Promise<Vessel> {
    const vessel = await this.vesselRepository.find(id)

    if (vessel === null) {
      throw new NotFoundError('Vessel do not exists')
    }

    return vessel
  }
}
