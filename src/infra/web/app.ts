import PortController from '@/tracking/adapters/controllers/PortController'
import CreatePortImpl from '@/tracking/application/CreatePortImpl'
import DeletePortImpl from '@/tracking/application/DeletePortImpl'
import GetAllPortsImpl from '@/tracking/application/GetAllPortsImpl'
import GetPortByIdImpl from '@/tracking/application/GetPortByIdImpl'
import express, { NextFunction, Request, Response, Router } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import NotFoundError from '@/tracking/application/errors/NotFoundError'
import IllegalOperationError from '@/tracking/domain/errors/IllegalOperationError'
import VesselController from '@/tracking/adapters/controllers/VesselController'
import GetAllVesselsImpl from '@/tracking/application/GetAllVesselsImpl'
import GetVesselByIdImpl from '@/tracking/application/GetVesselByIdImpl'
import CreateVesselImpl from '@/tracking/application/CreateVesselImpl'
import DeleteVesselImpl from '@/tracking/application/DeleteVesselImpl'
import DockVesselImpl from '@/tracking/application/DockVesselImpl'
import UndockVesselImpl from '@/tracking/application/UndockVesselImpl'
import ReplaceAllNextStopsImpl from '@/tracking/application/ReplaceAllNextStops'
import { Connection } from 'typeorm'
import PortRepositoryTypeOrm from '@/tracking/adapters/repositories/typeorm/PortReporitoryTypeOrm'
import VesselRepositoryTypeOrm from '@/tracking/adapters/repositories/typeorm/VesselRepositoryTypeOrm'
import AuthController from '@/auth/adapters/controllers/AuthController'
import SigninUserImpl from '@/auth/application/SigninUserImpl'
import SignupUserImpl from '@/auth/application/SignupUserImpl'
import IsAuthenticatedImpl from '@/auth/application/IsAuthenticatedImpl'
import JwtAuthenticator from '@/auth/adapters/authenticator/JwtAuthenticator'
import BcryptEncrypter from '@/auth/adapters/encrypter/BcryptEncrypter'
import UserRepositoryTypeOrm from '@/auth/adapters/repositories/typeorm/UserRepositoryTypeOrm'
import ForbiddenError from '@/auth/application/errors/ForbiddenError'
import UnauthorizedError from '@/auth/application/errors/UnauthorizedError'
import { appConfig } from '../config/config'

export class App {
  private app: express.Application
  private connection: Connection

  public constructor(connection: Connection) {
    this.connection = connection
    this.app = express()
    this.middleware()
    this.routes()
    this.errorHandlers()
  }

  private middleware() {
    this.app.use(express.json())
    this.app.use(cors())
    this.app.use(helmet())
  }

  private routes() {
    this.app.get('/', (req: Request, res: Response) => {
      res.json({ status: '👍' })
    })

    const { router: authRouter, authMiddleware } = this.authRoutes()

    this.app.use('/api/auth', authRouter)
    this.app.use('/api/ports', authMiddleware, this.portRoutes())
    this.app.use('/api/vessels', authMiddleware, this.vesselRoutes())
  }

  private errorHandlers() {
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      next(new NotFoundError('Route Not Found'))
    })

    this.app.use(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        switch (err.constructor) {
          case NotFoundError:
            res.status(404).json({ error: err.message })
            break
          case IllegalOperationError:
            res.status(400).json({ error: err.message })
            break
          case ForbiddenError:
            res.status(403).json({ error: err.message })
            break
          case UnauthorizedError:
            res.status(401).json({ error: err.message })
            break
          default:
            res.status(500).json({ error: err.message })
            break
        }
      }
    )
  }

  public getApp() {
    return this.app
  }

  private authRoutes() {
    const router = Router()
    const authController = this.makeAuthController()

    const authMiddleware = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        await authController.isAuthenticated(req, res, next)
      } catch (error) {
        next(error)
      }
    }

    router.post(
      '/signin',
      this.asyncHandler((req, res) => authController.signin(req, res))
    )
    router.post(
      '/signup',
      this.asyncHandler((req, res) => authController.signup(req, res))
    )
    router.get(
      '/user',
      this.asyncHandler((req, res) =>
        authController.getAuthenticatedUser(req, res)
      )
    )

    return { router, authMiddleware }
  }

  private portRoutes() {
    const router = Router()
    const portController = this.makePortController()
    router.get(
      '/',
      this.asyncHandler((req, res) => portController.findAll(req, res))
    )
    router.get(
      '/:id',
      this.asyncHandler((req, res) => portController.findById(req, res))
    )
    router.post(
      '/',
      this.asyncHandler((req, res) => portController.create(req, res))
    )
    router.delete(
      '/:id',
      this.asyncHandler((req, res) => portController.remove(req, res))
    )
    return router
  }

  private vesselRoutes() {
    const router = Router()
    const vesselController = this.makeVesselController()
    router.get(
      '/',
      this.asyncHandler((req, res) => vesselController.findAll(req, res))
    )
    router.get(
      '/:id',
      this.asyncHandler((req, res) => vesselController.findById(req, res))
    )
    router.post(
      '/',
      this.asyncHandler((req, res) => vesselController.create(req, res))
    )
    router.delete(
      '/:id',
      this.asyncHandler((req, res) => vesselController.remove(req, res))
    )
    router.put(
      '/:id/dock',
      this.asyncHandler((req, res) => vesselController.dock(req, res))
    )
    router.put(
      '/:id/undock',
      this.asyncHandler((req, res) => vesselController.undock(req, res))
    )
    router.put(
      '/:id/replaceNextStops',
      this.asyncHandler((req, res) =>
        vesselController.replaceNextStops(req, res)
      )
    )
    return router
  }

  private makeAuthController() {
    // const userRepository = new UserRepositoryInMem([])
    const userRepository = new UserRepositoryTypeOrm(this.connection)
    const authenticator = new JwtAuthenticator(
      appConfig.JWT_SECRET,
      appConfig.JWT_EXPIRES_IN
    )
    const encrypter = new BcryptEncrypter()
    return new AuthController(
      new SigninUserImpl(userRepository, authenticator, encrypter),
      new SignupUserImpl(userRepository, authenticator, encrypter),
      new IsAuthenticatedImpl(authenticator)
    )
  }

  private makePortController() {
    // const portRepository = new PortRepositoryInMem([])
    const portRepository = new PortRepositoryTypeOrm(this.connection)
    return new PortController(
      new GetAllPortsImpl(portRepository),
      new GetPortByIdImpl(portRepository),
      new CreatePortImpl(portRepository),
      new DeletePortImpl(portRepository)
    )
  }

  private makeVesselController() {
    // const vesselRepository = new VesselRepositoryInMem([])
    const vesselRepository = new VesselRepositoryTypeOrm(this.connection)
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

  private asyncHandler(fn: (req: Request, res: Response) => Promise<Response>) {
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
}
