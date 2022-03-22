import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'users' })
export default class UserEntity {
  @PrimaryColumn()
  id!: string

  @Column()
  name!: string

  @Column()
  email!: string

  @Column()
  pass!: string
}
