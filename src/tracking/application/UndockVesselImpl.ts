import NotFoundError from './errors/NotFoundError'
import IUndockVessel from './port/IUndockVessel'
import IVesselRepository from './port/IVesselRepository'

export default class UndockVesselImpl implements IUndockVessel {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(vesselId: string): Promise<void> {
    const vesselResult = await this.vesselRepository.find(vesselId)

    if (vesselResult === null) {
      throw new NotFoundError('Vessel do not exists')
    }

    vesselResult.undock()

    await this.vesselRepository.save(vesselResult)
  }
}
