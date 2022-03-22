import ICreateVessel from '@/tracking/application/port/ICreateVessel'
import IDeleteVessel from '@/tracking/application/port/IDeleteVessel'
import IDockVessel from '@/tracking/application/port/IDockVessel'
import IGetAllVessels from '@/tracking/application/port/IGetAllVessels'
import IGetVesselById from '@/tracking/application/port/IGetVesselById'
import IReplaceAllNextStops from '@/tracking/application/port/IReplaceAllNextStops'
import IUndockVessel from '@/tracking/application/port/IUndockVessel'
import IllegalOperationError from '@/tracking/domain/errors/IllegalOperationError'
import Stop from '@/tracking/domain/Stop'
import Vessel from '@/tracking/domain/Vessel'
import { Request, Response } from 'express'

export default class VesselController {
  private readonly getAllVessels: IGetAllVessels
  private readonly getVesselById: IGetVesselById
  private readonly createVessel: ICreateVessel
  private readonly deleteVessel: IDeleteVessel
  private readonly dockVessel: IDockVessel
  private readonly undockVessel: IUndockVessel
  private readonly replaceAllNextStops: IReplaceAllNextStops

  constructor(
    getAllVessels: IGetAllVessels,
    getVesselById: IGetVesselById,
    createVessel: ICreateVessel,
    deleteVessel: IDeleteVessel,
    dockVessel: IDockVessel,
    undockVessel: IUndockVessel,
    replaceAllNextStops: IReplaceAllNextStops
  ) {
    this.getAllVessels = getAllVessels
    this.getVesselById = getVesselById
    this.createVessel = createVessel
    this.deleteVessel = deleteVessel
    this.dockVessel = dockVessel
    this.undockVessel = undockVessel
    this.replaceAllNextStops = replaceAllNextStops
  }

  public async findAll(req: Request, res: Response): Promise<Response> {
    const vessels = await this.getAllVessels.execute()
    return res.status(200).json(vessels.map((vessel) => this.toView(vessel)))
  }

  public async findById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    const vessel: Vessel = await this.getVesselById.execute(id)
    return res.status(200).json(this.toView(vessel))
  }

  public async create(req: Request, res: Response): Promise<Response> {
    if (
      !(req.body.name && req.body.ownership && req.body.year && req.body.portId)
    ) {
      throw new IllegalOperationError('Invalid args')
    }
    const { name, ownership, year, portId } = req.body
    await this.createVessel.execute(name, ownership, year, portId)
    return res.status(201).end()
  }

  public async remove(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    await this.deleteVessel.execute(id)
    return res.status(204).end()
  }

  public async dock(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    await this.dockVessel.execute(id)
    return res.status(204).end()
  }

  public async undock(req: Request, res: Response): Promise<Response> {
    const { id } = req.params
    await this.undockVessel.execute(id)
    return res.status(204).end()
  }

  public async replaceNextStops(
    req: Request,
    res: Response
  ): Promise<Response> {
    if (!req.body.nextPortIds) {
      throw new IllegalOperationError('Invalid args')
    }
    const { id: vesselId } = req.params
    const { nextPortIds } = req.body
    await this.replaceAllNextStops.execute(vesselId, nextPortIds)
    return res.status(204).end()
  }

  private toView(vessel: Vessel) {
    return {
      id: vessel.id,
      name: vessel.name,
      ownership: vessel.ownership,
      status: vessel.status,
      year: vessel.year,
      currentStop: this.toStopView(vessel.currentStop),
      previousStops: vessel.previousStops.map((stop) => this.toStopView(stop)),
      nextStops: vessel.nextStops.map((stop) => this.toStopView(stop))
    }
  }

  private toStopView(stop: Stop | null) {
    return stop
      ? {
          id: stop.id,
          portId: stop.portId,
          dateIn: stop.dateIn,
          dateOut: stop.dateOut
        }
      : null
  }
}
