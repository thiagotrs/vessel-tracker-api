import Port from '../domain/Port'
import { IGetAllPorts } from './port/IGetAllPorts'
import IPortRepository from './port/IPortRepository'

export default class GetAllPortsImpl implements IGetAllPorts {
  private readonly portRepository: IPortRepository

  constructor(portRepository: IPortRepository) {
    this.portRepository = portRepository
  }

  async execute(): Promise<Port[]> {
    return await this.portRepository.findAll()
  }
}
