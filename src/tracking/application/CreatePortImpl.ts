import Port from '../domain/Port'
import ICreatePort from './port/ICreatePort'
import IPortRepository from './port/IPortRepository'

export default class CreatePortImpl implements ICreatePort {
  private readonly portRepository: IPortRepository

  constructor(portRepository: IPortRepository) {
    this.portRepository = portRepository
  }

  async execute(
    name: string,
    capacity: number,
    country: string,
    city: string,
    coordinates: [number, number]
  ): Promise<void> {
    const port = Port.create(name, capacity, country, city, coordinates)

    await this.portRepository.save(port)
  }
}
