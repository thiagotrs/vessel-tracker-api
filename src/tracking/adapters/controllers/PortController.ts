import ICreatePort from '../../application/port/ICreatePort'
import IDeletePort from '../../application/port/IDeletePort'
import { IGetAllPorts } from '../../application/port/IGetAllPorts'
import { IGetPortById } from '../../application/port/IGetPortById'
import IllegalOperationError from '../../domain/errors/IllegalOperationError'
import Port from '../../domain/Port'
import { Request, Response } from 'express'

export default class PortController {
  private readonly getAllPorts: IGetAllPorts
  private readonly getPortById: IGetPortById
  private readonly createPort: ICreatePort
  private readonly deletePort: IDeletePort

  constructor(
    getAllPorts: IGetAllPorts,
    getPortById: IGetPortById,
    createPort: ICreatePort,
    deletePort: IDeletePort
  ) {
    this.getAllPorts = getAllPorts
    this.getPortById = getPortById
    this.createPort = createPort
    this.deletePort = deletePort
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    const ports = await this.getAllPorts.execute()
    return res.status(200).json(ports.map((port) => this.toView(port)))
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    const port: Port = await this.getPortById.execute(id)
    return res.status(200).json(this.toView(port))
  }

  public async create(req: Request, res: Response): Promise<Response> {
    if (
      !(req.body.name && req.body.capacity && req.body.country && req.body.city)
    ) {
      throw new IllegalOperationError('Invalid args')
    }
    const { name, capacity, country, city, coordinates } = req.body
    await this.createPort.execute(name, capacity, country, city, coordinates)
    return res.status(201).end()
  }

  public async remove(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    await this.deletePort.execute(id)
    return res.status(204).end()
  }

  private toView(port: Port) {
    return {
      id: port.id,
      name: port.name,
      capacity: port.capacity,
      country: port.country,
      city: port.city,
      coordinates: port.coordinates
    }
  }
}
