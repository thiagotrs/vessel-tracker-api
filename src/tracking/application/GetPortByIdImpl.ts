import Port from '../domain/Port'
import NotFoundError from './errors/NotFoundError'
import { IGetPortById } from './port/IGetPortById'
import IPortRepository from './port/IPortRepository'

export default class GetPortByIdImpl implements IGetPortById {
  private readonly portRepository: IPortRepository

  constructor(portRepository: IPortRepository) {
    this.portRepository = portRepository
  }

  async execute(id: string): Promise<Port> {
    const port = await this.portRepository.find(id)

    if (port === null) {
      throw new NotFoundError('Port do not exists')
    }

    return port
  }
}
