import IPortRepository from '@/tracking/application/port/IPortRepository'
import Port from '@/tracking/domain/Port'

export default class PortRepositoryInMem implements IPortRepository {
  private _ports: Port[]

  get ports(): Port[] {
    return this._ports
  }

  constructor(ports: Port[]) {
    this._ports = ports
  }

  async findAll(): Promise<Port[]> {
    return this._ports
  }

  async find(id: string): Promise<Port | null> {
    return this._ports.find((port) => port.id === id) || null
  }

  async delete(port: Port): Promise<void> {
    const portResult: Port | undefined = this._ports.find(
      (p) => p.id === port.id
    )

    if (!portResult) {
      throw new Error('Invalid Operation.')
    }

    this._ports = this._ports.filter((p) => p.id !== port.id)
  }

  async save(port: Port): Promise<void> {
    const portResultIndex = this._ports.findIndex((p) => p.id === port.id)

    if (portResultIndex >= 0) {
      this._ports[portResultIndex] = port
    } else {
      this._ports = [...this._ports, port]
    }
  }
}
