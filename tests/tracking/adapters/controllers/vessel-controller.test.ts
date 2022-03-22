import request from 'supertest'
import express, { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '@/tracking/application/errors/NotFoundError'
import IllegalOperationError from '@/tracking/domain/errors/IllegalOperationError'
import VesselRepositoryInMem from '@/tracking/adapters/repositories/VesselRepositoryInMem'
import VesselController from '@/tracking/adapters/controllers/VesselController'
import GetAllVesselsImpl from '@/tracking/application/GetAllVesselsImpl'
import GetVesselByIdImpl from '@/tracking/application/GetVesselByIdImpl'
import CreateVesselImpl from '@/tracking/application/CreateVesselImpl'
import DeleteVesselImpl from '@/tracking/application/DeleteVesselImpl'
import DockVesselImpl from '@/tracking/application/DockVesselImpl'
import UndockVesselImpl from '@/tracking/application/UndockVesselImpl'
import ReplaceAllNextStopsImpl from '@/tracking/application/ReplaceAllNextStops'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'
import Stop from '@/tracking/domain/Stop'

const app = express()

const makeVessel = () => {
  return Vessel.of(
    '3f576b45-675d-4df7-96f0-2e35c6310780',
    'Atlantic Vessel 43',
    'Atantic Log Inc',
    VesselStatus.PARKED,
    1985,
    Stop.of(
      'ce1f9df4-daa8-4784-acbf-6c829c39e1a7',
      '229be4db-c7f3-43a7-96cd-f171b0a5a996',
      new Date('2022-03-10T16:28:56.269Z'),
      null
    ),
    [],
    []
  )
}

const makeSailingVessel = () => {
  const id = '835c111f-4632-4157-bc3f-a7e6e7ddac01'
  const name = 'Atlantic Vessel 85'
  const ownership = 'Atantic Log Inc'
  const status = VesselStatus.SAILING
  const year = 1993

  const stopId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
  const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
  const dateIn = new Date('2022-03-10T16:28:56.269Z')
  const dateOut = new Date(Date.parse('2022-03-10T16:28:56.269Z') + 1000)
  const lastStop = Stop.of(stopId, portId, dateIn, dateOut)

  const currentStop = null
  const previousStops: Stop[] = [lastStop]
  const nextStops: Stop[] = []

  return Vessel.of(
    id,
    name,
    ownership,
    status,
    year,
    currentStop,
    previousStops,
    nextStops
  )
}

const toStopView = (stop: Stop | null) => {
  return stop
    ? {
        id: stop.id,
        portId: stop.portId,
        dateIn: stop.dateIn?.toISOString() || null,
        dateOut: stop.dateOut?.toISOString() || null
      }
    : null
}

const toView = (vessel: Vessel) => {
  return {
    id: vessel.id,
    name: vessel.name,
    ownership: vessel.ownership,
    status: vessel.status,
    year: vessel.year,
    currentStop: toStopView(vessel.currentStop),
    previousStops: vessel.previousStops.map((stop) => toStopView(stop)),
    nextStops: vessel.nextStops.map((stop) => toStopView(stop))
  }
}

const vesselRepository = new VesselRepositoryInMem([
  makeVessel(),
  makeSailingVessel()
])

const makeVesselController = (vesselRepository: any) => {
  return new VesselController(
    new GetAllVesselsImpl(vesselRepository),
    new GetVesselByIdImpl(vesselRepository),
    new CreateVesselImpl(vesselRepository),
    new DeleteVesselImpl(vesselRepository),
    new DockVesselImpl(vesselRepository),
    new UndockVesselImpl(vesselRepository),
    new ReplaceAllNextStopsImpl(vesselRepository)
  )
}

const asyncHandler = (
  fn: (req: Request, res: Response) => Promise<Response>
) => {
  return async function (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      return await fn(req, res)
    } catch (error) {
      next(error)
    }
  }
}

const vesselRoutes = () => {
  const router = Router()
  const vesselController = makeVesselController(vesselRepository)
  router.get(
    '/',
    asyncHandler((req, res) => vesselController.findAll(req, res))
  )
  router.get(
    '/:id',
    asyncHandler((req, res) => vesselController.findById(req, res))
  )
  router.post(
    '/',
    asyncHandler((req, res) => vesselController.create(req, res))
  )
  router.delete(
    '/:id',
    asyncHandler((req, res) => vesselController.remove(req, res))
  )
  router.put(
    '/:id/dock',
    asyncHandler((req, res) => vesselController.dock(req, res))
  )
  router.put(
    '/:id/undock',
    asyncHandler((req, res) => vesselController.undock(req, res))
  )
  router.put(
    '/:id/replaceNextStops',
    asyncHandler((req, res) => vesselController.replaceNextStops(req, res))
  )
  return router
}

app.use(express.json())

app.use('/api/vessels', vesselRoutes())

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    switch (err.constructor) {
      case NotFoundError:
        res.status(404).json({ error: err.message })
        break
      case IllegalOperationError:
        res.status(400).json({ error: err.message })
        break
      default:
        res.status(500).json({ error: err.message })
        break
    }
  }
)

describe('VesselController', () => {
  beforeEach(() => {
    vesselRepository.reset([makeVessel(), makeSailingVessel()])
  })

  it('should return all vessels', async () => {
    const expectedVessel = makeVessel()
    const expectedSailingVessel = makeSailingVessel()
    const response = await request(app)
      .get('/api/vessels')
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual([
      toView(expectedVessel),
      toView(expectedSailingVessel)
    ])
  })

  it('should return vessel when given id', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .get('/api/vessels/' + expectedVessel.id)
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual(toView(expectedVessel))
  })

  it('should not return vessel when given wrong id', async () => {
    const response = await request(app)
      .get('/api/vessels/' + 'wrong-id')
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Vessel do not exists' })
  })

  it('should delete vessel when given id', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .delete('/api/vessels/' + expectedVessel.id)
      .set('Accept', 'application/json')

    expect(response.status).toEqual(204)
    expect(response.body).toEqual({})
    expect(response.noContent).toBeTruthy()
  })

  it('should not delete vessel when given wrong id', async () => {
    const response = await request(app)
      .delete('/api/vessels/' + 'wrong-id')
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Vessel do not exists' })
  })

  it('should create vessel when given inputs', async () => {
    const response = await request(app)
      .post('/api/vessels')
      .set('Accept', 'application/json')
      .send({
        name: 'Atlantic Ship',
        ownership: 'Atlantic Log.',
        year: 2015,
        portId: '229be4db-c7f3-43a7-96cd-f171b0a5a996'
      })

    expect(response.status).toEqual(201)
    expect(response.body).toEqual({})
  })

  it('should not create vessel when given wrong inputs', async () => {
    const response = await request(app)
      .post('/api/vessels')
      .set('Accept', 'application/json')
      .send({
        name: 'Atlantic Ship',
        ownership: 'Atlantic Log.',
        year: 2015,
        portId: 'wrong-id'
      })

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Invalid args' })
  })

  it('should undock vessel when given id', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedVessel.id + '/undock')
      .set('Accept', 'application/json')

    expect(response.status).toEqual(204)
    expect(response.body).toEqual({})
  })

  it('should not undock vessel when given wrong id', async () => {
    const response = await request(app)
      .put('/api/vessels/' + 'wrong id' + '/undock')
      .set('Accept', 'application/json')

    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Vessel do not exists' })
  })

  it('should not undock vessel when sailing', async () => {
    const expectedSailingVessel = makeSailingVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedSailingVessel.id + '/undock')
      .set('Accept', 'application/json')

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Vessel is already Sailing.' })
  })

  it('should not dock vessel when wrong id', async () => {
    const response = await request(app)
      .put('/api/vessels/' + 'wrong id' + '/dock')
      .set('Accept', 'application/json')

    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Vessel do not exists' })
  })

  it('should not dock vessel when parked', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedVessel.id + '/dock')
      .set('Accept', 'application/json')

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Vessel is already Parked.' })
  })

  it('should not dock vessel when has not next stop', async () => {
    const expectedSailingVessel = makeSailingVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedSailingVessel.id + '/dock')
      .set('Accept', 'application/json')

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'There is not next stop.' })
  })

  it('should replace next vessel stops', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedVessel.id + '/replaceNextStops')
      .set('Accept', 'application/json')
      .send({
        nextPortIds: [
          'ce1f9df4-daa8-4784-acbf-6c829c39e1a7',
          '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
        ]
      })

    expect(response.status).toEqual(204)
    expect(response.body).toEqual({})
  })

  it('should replace next vessel stops when given wrong id', async () => {
    const response = await request(app)
      .put('/api/vessels/' + 'wrong-id' + '/replaceNextStops')
      .set('Accept', 'application/json')
      .send({
        nextPortIds: [
          'ce1f9df4-daa8-4784-acbf-6c829c39e1a7',
          '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
        ]
      })

    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Vessel do not exists' })
  })

  it('should replace next vessel stops when given invalid inputs', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedVessel.id + '/replaceNextStops')
      .set('Accept', 'application/json')
      .send({})

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Invalid args' })
  })

  it('should replace next vessel stops when given port ids are same', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedVessel.id + '/replaceNextStops')
      .set('Accept', 'application/json')
      .send({
        nextPortIds: [
          'ce1f9df4-daa8-4784-acbf-6c829c39e1a7',
          'ce1f9df4-daa8-4784-acbf-6c829c39e1a7'
        ]
      })

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Next stops must not be same port' })
  })

  it('should replace next vessel stops when given port ids are same', async () => {
    const expectedVessel = makeVessel()
    const response = await request(app)
      .put('/api/vessels/' + expectedVessel.id + '/replaceNextStops')
      .set('Accept', 'application/json')
      .send({
        nextPortIds: ['229be4db-c7f3-43a7-96cd-f171b0a5a996']
      })

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Next stops must not be same port' })
  })
})
