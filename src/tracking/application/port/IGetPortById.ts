import Port from '@/tracking/domain/Port'

export interface IGetPortById {
  execute(id: string): Promise<Port>
}
