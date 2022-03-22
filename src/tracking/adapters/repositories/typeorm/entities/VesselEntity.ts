import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { StopEntity, StopStatus } from './StopEntity'

export enum VesselEntityStatus {
  SAILING = 'Sailing',
  PARKED = 'Parked'
}

@Entity({ name: 'vessels' })
export class VesselEntity {
  @PrimaryColumn()
  id!: string

  @Column()
  name!: string

  @Column()
  ownership!: string

  @Column()
  status!: VesselEntityStatus

  @Column()
  year!: number

  @OneToMany(() => StopEntity, (stop) => stop.vessel, {
    eager: true,
    cascade: true
  })
  stops!: StopEntity[]

  get currentStop(): StopEntity | null {
    return this.stops.find((stop) => stop.status === StopStatus.CURRENT) || null
  }

  get previousStops(): StopEntity[] {
    return this.stops.filter((stop) => stop.status === StopStatus.PREVIOUS)
  }

  get nextStops(): StopEntity[] {
    return this.stops.filter((stop) => stop.status === StopStatus.NEXT)
  }
}
