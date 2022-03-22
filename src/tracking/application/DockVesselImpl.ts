import NotFoundError from './errors/NotFoundError'
import IDockVessel from './port/IDockVessel'
import IVesselRepository from './port/IVesselRepository'

export default class DockVesselImpl implements IDockVessel {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(vesselId: string): Promise<void> {
    const vesselResult = await this.vesselRepository.find(vesselId)

    if (vesselResult === null) {
      throw new NotFoundError('Vessel do not exists')
    }

    vesselResult.dock()

    await this.vesselRepository.save(vesselResult)
  }
}
