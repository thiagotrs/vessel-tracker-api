import NotFoundError from './errors/NotFoundError'
import IDeleteVessel from './port/IDeleteVessel'
import IVesselRepository from './port/IVesselRepository'

export default class DeleteVesselImpl implements IDeleteVessel {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(id: string): Promise<void> {
    const vesselResult = await this.vesselRepository.find(id)

    if (vesselResult === null) {
      throw new NotFoundError('Vessel do not exists')
    }

    await this.vesselRepository.delete(vesselResult)
  }
}
