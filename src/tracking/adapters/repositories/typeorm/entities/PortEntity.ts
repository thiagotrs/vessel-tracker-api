import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity({ name: 'ports' })
export class PortEntity {
  @PrimaryColumn()
  id!: string

  @Column()
  name!: string

  @Column()
  capacity!: number

  @Column()
  country!: string

  @Column()
  city!: string

  @Column({ nullable: true })
  lat?: number

  @Column({ nullable: true })
  long?: number

  get coordinates(): [number, number] | null {
    return this.lat && this.long ? [this.lat, this.long] : null
  }

  set coordinates(coord: [number, number] | null) {
    if (coord) {
      this.lat = coord[0]
      this.long = coord[1]
    }
  }
}
