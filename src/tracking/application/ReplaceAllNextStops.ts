import Stop from '../domain/Stop'
import NotFoundError from './errors/NotFoundError'
import IReplaceAllNextStops from './port/IReplaceAllNextStops'
import IVesselRepository from './port/IVesselRepository'

export default class ReplaceAllNextStopsImpl implements IReplaceAllNextStops {
  private readonly vesselRepository: IVesselRepository

  constructor(vesselRepository: IVesselRepository) {
    this.vesselRepository = vesselRepository
  }

  async execute(vesselId: string, nextPortIds: string[]): Promise<void> {
    const vesselResult = await this.vesselRepository.find(vesselId)

    if (vesselResult === null) {
      throw new NotFoundError('Vessel do not exists')
    }

    const nextStops = nextPortIds.map((portId) => Stop.create(portId))

    vesselResult.replaceAllNextStops(nextStops)

    await this.vesselRepository.save(vesselResult)
  }
}
