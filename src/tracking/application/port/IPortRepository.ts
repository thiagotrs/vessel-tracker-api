import Port from '../../domain/Port'

export default interface IPortRepository {
  findAll(): Promise<Port[]>

  find(id: string): Promise<Port | null>

  delete(port: Port): Promise<void>

  save(port: Port): Promise<void>
}
