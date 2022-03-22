import request from 'supertest'
import PortRepositoryInMem from '@/tracking/adapters/repositories/PortRepositoryInMem'
import PortController from '@/tracking/adapters/controllers/PortController'
import GetAllPortsImpl from '@/tracking/application/GetAllPortsImpl'
import GetPortByIdImpl from '@/tracking/application/GetPortByIdImpl'
import CreatePortImpl from '@/tracking/application/CreatePortImpl'
import DeletePortImpl from '@/tracking/application/DeletePortImpl'
import express, { NextFunction, Request, Response, Router } from 'express'
import Port from '@/tracking/domain/Port'
import NotFoundError from '@/tracking/application/errors/NotFoundError'
import IllegalOperationError from '@/tracking/domain/errors/IllegalOperationError'

const app = express()

const makePort = () => {
  return Port.of(
    'ce1f9df4-daa8-4784-acbf-6c829c39e1a7',
    'Rio Port',
    50,
    'Brazil',
    'Rio de Janeiro',
    [-22.8918072, -43.2164655]
  )
}

const makePortController = () => {
  const portRepository = new PortRepositoryInMem([makePort()])
  return new PortController(
    new GetAllPortsImpl(portRepository),
    new GetPortByIdImpl(portRepository),
    new CreatePortImpl(portRepository),
    new DeletePortImpl(portRepository)
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

const portRoutes = () => {
  const router = Router()
  const portController = makePortController()
  router.get(
    '/',
    asyncHandler((req, res) => portController.findAll(req, res))
  )
  router.get(
    '/:id',
    asyncHandler((req, res) => portController.findById(req, res))
  )
  router.post(
    '/',
    asyncHandler((req, res) => portController.create(req, res))
  )
  router.delete(
    '/:id',
    asyncHandler((req, res) => portController.remove(req, res))
  )
  return router
}

app.use(express.json())

app.use('/api/ports', portRoutes())

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

describe('PortController', () => {
  it('should return all ports', async () => {
    const expectedPort = makePort()
    const response = await request(app)
      .get('/api/ports')
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual([
      {
        id: expectedPort.id,
        name: expectedPort.name,
        capacity: expectedPort.capacity,
        country: expectedPort.country,
        city: expectedPort.city,
        coordinates: expectedPort.coordinates
      }
    ])
  })

  it('should return port when given id', async () => {
    const expectedPort = makePort()
    const response = await request(app)
      .get('/api/ports/' + expectedPort.id)
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      id: expectedPort.id,
      name: expectedPort.name,
      capacity: expectedPort.capacity,
      country: expectedPort.country,
      city: expectedPort.city,
      coordinates: expectedPort.coordinates
    })
  })

  it('should not return port when given wrong id', async () => {
    const response = await request(app)
      .get('/api/ports/' + 'wrong-id')
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Port do not exists' })
  })

  it('should delete port when given id', async () => {
    const expectedPort = makePort()
    const response = await request(app)
      .delete('/api/ports/' + expectedPort.id)
      .set('Accept', 'application/json')

    expect(response.status).toEqual(204)
    expect(response.body).toEqual({})
    expect(response.noContent).toBeTruthy()
  })

  it('should not delete port when given wrong id', async () => {
    const response = await request(app)
      .delete('/api/ports/' + 'wrong-id')
      .set('Accept', 'application/json')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(404)
    expect(response.body).toEqual({ error: 'Port do not exists' })
  })

  it('should create port', async () => {
    const response = await request(app)
      .post('/api/ports')
      .set('Accept', 'application/json')
      .send({
        name: 'Rio Port 20',
        capacity: 50,
        country: 'Brazil',
        city: 'Rio de Janeiro',
        coordinates: [-22.8918072, -43.2164655]
      })

    expect(response.status).toEqual(201)
    expect(response.body).toEqual({})
  })

  it('should not create port when given wrong inputs', async () => {
    const response = await request(app)
      .post('/api/ports')
      .set('Accept', 'application/json')
      .send({
        name: 'Rio Port 20',
        country: 'Brazil'
      })

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: 'Invalid args' })
  })
})
