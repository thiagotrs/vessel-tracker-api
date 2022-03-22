import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { PortEntity } from './PortEntity'
import { VesselEntity } from './VesselEntity'

export enum StopStatus {
  CURRENT = 'current',
  PREVIOUS = 'previous',
  NEXT = 'next'
}

@Entity({ name: 'stops' })
export class StopEntity {
  @PrimaryColumn()
  id!: string

  @Column({ nullable: true })
  dateIn?: Date

  @Column({ nullable: true })
  dateOut?: Date

  @Column({ nullable: true })
  portId!: string

  @ManyToOne(() => PortEntity)
  port!: PortEntity

  @ManyToOne(() => VesselEntity, (vessel) => vessel.stops)
  vessel!: VesselEntity

  get status(): StopStatus {
    if (this.dateIn && this.dateOut) {
      return StopStatus.PREVIOUS
    }

    if (this.dateIn && this.dateOut === null) {
      return StopStatus.CURRENT
    }

    return StopStatus.NEXT
  }
}
