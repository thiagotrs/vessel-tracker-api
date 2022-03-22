import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class StopsMigration1646860687779 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'stops',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true
          },
          {
            name: 'dateIn',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'dateOut',
            type: 'varchar',
            isNullable: true
          },
          {
            name: 'portId',
            type: 'varchar',
            isNullable: false
          },
          {
            name: 'vesselId',
            type: 'varchar',
            isNullable: false
          }
        ],
        foreignKeys: [
          {
            columnNames: ['portId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'ports',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          {
            columnNames: ['vesselId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'vessels',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          }
        ]
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('stops')
  }
}
