import { join } from 'path'
import 'reflect-metadata'
import { Connection, createConnection, getConnectionOptions } from 'typeorm'

export const connect = async (): Promise<Connection> => {
  const connectionOptions = await getConnectionOptions()
  Object.assign(connectionOptions, {
    entities: [join(__dirname, '/../../**/*Entity{.ts,.js}')]
  })
  return await createConnection(connectionOptions)
}
