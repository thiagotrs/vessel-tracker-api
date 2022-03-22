import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'
import { Connection } from 'typeorm'
import { StopEntity } from './entities/StopEntity'
import { VesselEntity, VesselEntityStatus } from './entities/VesselEntity'

export default class VesselRepositoryTypeOrm implements IVesselRepository {
  private readonly connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  async findAll(): Promise<Vessel[]> {
    const vesselEntity = await this.connection
      .getRepository(VesselEntity)
      .find()
    return vesselEntity.map((vesselEntity) => this.toData(vesselEntity))
  }

  async find(id: string): Promise<Vessel | null> {
    const vesselEntity = await this.connection
      .getRepository(VesselEntity)
      .findOne(id)
    return vesselEntity ? this.toData(vesselEntity) : null
  }

  async delete(vessel: Vessel): Promise<void> {
    await this.connection.getRepository(VesselEntity).delete(vessel.id)
  }

  async save(vessel: Vessel): Promise<void> {
    const vesselEntity = new VesselEntity()
    vesselEntity.id = vessel.id
    vesselEntity.name = vessel.ownership
    vesselEntity.status = vessel.status as unknown as VesselEntityStatus
    vesselEntity.ownership = vessel.ownership
    vesselEntity.year = vessel.year
    vesselEntity.stops = [
      ...vessel.previousStops.map((stop) => this.toStopEntity(stop))
    ]
    vesselEntity.stops = vessel.currentStop
      ? vesselEntity.stops.concat(this.toStopEntity(vessel.currentStop))
      : vesselEntity.stops
    vesselEntity.stops = vesselEntity.stops.concat(
      vessel.nextStops.map((stop) => this.toStopEntity(stop))
    )
    await this.connection.getRepository(VesselEntity).save(vesselEntity)
  }

  private toData(vesselEntity: VesselEntity): Vessel {
    return Vessel.of(
      vesselEntity.id,
      vesselEntity.name,
      vesselEntity.ownership,
      vesselEntity.status as unknown as VesselStatus,
      vesselEntity.year,
      this.toStopData(vesselEntity.currentStop),
      vesselEntity.previousStops.map((stop) => this.toStopData(stop) as Stop),
      vesselEntity.nextStops.map((stop) => this.toStopData(stop) as Stop)
    )
  }

  private toStopData(stopEntity: StopEntity | null): Stop | null {
    return stopEntity
      ? Stop.of(
          stopEntity.id,
          stopEntity.portId,
          stopEntity.dateIn || null,
          stopEntity.dateOut || null
        )
      : null
  }

  private toStopEntity(stop: Stop) {
    const stopEntity = new StopEntity()
    stopEntity.id = stop.id
    stopEntity.portId = stop.portId
    stopEntity.dateIn = stop.dateIn || undefined
    stopEntity.dateOut = stop.dateOut || undefined
    return stopEntity
  }
}
