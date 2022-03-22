import IPortRepository from '@/tracking/application/port/IPortRepository'
import Port from '@/tracking/domain/Port'
import { Connection } from 'typeorm'
import { PortEntity } from './entities/PortEntity'

export default class PortRepositoryTypeOrm implements IPortRepository {
  private readonly connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  async findAll(): Promise<Port[]> {
    const portEntity = await this.connection.getRepository(PortEntity).find()
    return portEntity.map((portEntity) => this.toData(portEntity))
  }

  async find(id: string): Promise<Port | null> {
    const portEntity = await this.connection
      .getRepository(PortEntity)
      .findOne(id)
    return portEntity ? this.toData(portEntity) : null
  }

  async delete(port: Port): Promise<void> {
    await this.connection.manager.transaction(async (tx) => {
      try {
        await tx.delete(PortEntity, port.id)
        // await this.connection.getRepository(PortEntity).delete(port.id)
      } catch (error) {
        throw new Error('Invalid Operation.')
      }
    })
  }

  async save(port: Port): Promise<void> {
    const portEntity = new PortEntity()
    portEntity.id = port.id
    portEntity.name = port.name
    portEntity.capacity = port.capacity
    portEntity.country = port.country
    portEntity.city = port.city
    portEntity.coordinates = port?.coordinates
    await this.connection.getRepository(PortEntity).save(portEntity)
  }

  private toData(portEntity: PortEntity): Port {
    return Port.of(
      portEntity.id,
      portEntity.name,
      portEntity.capacity,
      portEntity.country,
      portEntity.city,
      portEntity.coordinates as [number, number] // remove after refact
    )
  }
}
