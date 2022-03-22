import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class PortMigration1646779614992 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ports',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'capacity',
            type: 'integer',
            isNullable: false
          },
          {
            name: 'country',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'city',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'lat',
            type: 'float',
            isNullable: true
          },
          {
            name: 'long',
            type: 'float',
            isNullable: true
          }
        ]
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ports')
  }
}
