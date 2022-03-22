import 'reflect-metadata'
import { Connection, createConnection } from 'typeorm'

export const connect = async (): Promise<Connection> => await createConnection()
