import Port from '../../domain/Port'

export interface IGetPortById {
  execute(id: string): Promise<Port>
}
