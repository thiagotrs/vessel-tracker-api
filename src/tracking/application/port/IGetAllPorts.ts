import Port from '@/tracking/domain/Port'

export interface IGetAllPorts {
  execute(): Promise<Port[]>
}
