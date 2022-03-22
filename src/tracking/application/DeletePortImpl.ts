import NotFoundError from './errors/NotFoundError'
import IDeletePort from './port/IDeletePort'
import IPortRepository from './port/IPortRepository'

export default class DeletePortImpl implements IDeletePort {
  private readonly portRepository: IPortRepository

  constructor(portRepository: IPortRepository) {
    this.portRepository = portRepository
  }

  async execute(id: string): Promise<void> {
    const portResult = await this.portRepository.find(id)

    if (portResult === null) {
      throw new NotFoundError('Port do not exists')
    }

    await this.portRepository.delete(portResult)
  }
}
