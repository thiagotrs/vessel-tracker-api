import Port from '../../domain/Port'

export interface IGetAllPorts {
  execute(): Promise<Port[]>
}
