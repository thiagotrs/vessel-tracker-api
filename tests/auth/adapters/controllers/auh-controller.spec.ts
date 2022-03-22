import request from 'supertest'
import JwtAuthenticator from '@/auth/adapters/authenticator/JwtAuthenticator'
import AuthController from '@/auth/adapters/controllers/AuthController'
import BcryptEncrypter from '@/auth/adapters/encrypter/BcryptEncrypter'
import UserRepositoryInMem from '@/auth/adapters/repositories/UserRepositoryInMem'
import IsAuthenticatedImpl from '@/auth/application/IsAuthenticatedImpl'
import SigninUserImpl from '@/auth/application/SigninUserImpl'
import SignupUserImpl from '@/auth/application/SignupUserImpl'
import NotFoundError from '@/tracking/application/errors/NotFoundError'
import IllegalOperationError from '@/tracking/domain/errors/IllegalOperationError'
import express, { NextFunction, Request, Response, Router } from 'express'
import User from '@/auth/domain/User'
import ForbiddenError from '@/auth/application/errors/ForbiddenError'
import UnauthorizedError from '@/auth/application/errors/UnauthorizedError'

const app = express()

const makeUser = () => {
  return User.of(
    'ce1f9df4-daa8-4784-acbf-6c829c39e1a7',
    'John Doe',
    'john@doe.com',
    '$2b$10$jtSxU7UX2j2iVvbUGhtJ3ejGpF7FHKpuRMMTlBCN5/tadQmTq.7dS'
  )
}

const makeAuthController = () => {
  const userRepository = new UserRepositoryInMem([makeUser()])
  const authenticator = new JwtAuthenticator('secret', 3600)
  const encrypter = new BcryptEncrypter()
  return new AuthController(
    new SigninUserImpl(userRepository, authenticator, encrypter),
    new SignupUserImpl(userRepository, authenticator, encrypter),
    new IsAuthenticatedImpl(authenticator)
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

const authRoutes = () => {
  const router = Router()
  const authController = makeAuthController()

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
    asyncHandler((req, res) => authController.signin(req, res))
  )
  router.post(
    '/signup',
    asyncHandler((req, res) => authController.signup(req, res))
  )
  router.get(
    '/user',
    asyncHandler((req, res) => authController.getAuthenticatedUser(req, res))
  )

  return { router, authMiddleware }
}

app.use(express.json())

const { router: authRouter } = authRoutes()

app.use('/api/auth', authRouter)

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

describe('AuthController', () => {
  it('should signup user', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .set('Accept', 'application/json')
      .send({
        name: 'John Doe Son',
        email: 'john@doeson.com',
        pass: 'admin1234'
      })

    expect(response.status).toEqual(201)
    expect(response.body).toHaveProperty('token')
    expect(typeof response.body.token).toBe('string')
  })

  it('should signin user', async () => {
    const expectedUser = makeUser()
    const response = await request(app)
      .post('/api/auth/signin')
      .set('Accept', 'application/json')
      .send({
        email: expectedUser.email,
        pass: 'admin1234'
      })

    expect(response.status).toEqual(201)
    expect(response.body).toHaveProperty('token')
    expect(typeof response.body.token).toBe('string')
  })

  it('should not signin user when invalid inputs', async () => {
    const response = await request(app)
      .post('/api/auth/signin')
      .set('Accept', 'application/json')
      .send({
        email: 'invalid-email',
        pass: 'invalid-pass'
      })

    expect(response.status).toEqual(403)
    expect(response.body).toEqual({
      error: 'Invalid email and/or pass'
    })
  })

  it('should get authenticated user', async () => {
    const expectedUser = makeUser()
    const response = await request(app)
      .get('/api/auth/user/')
      .set('Accept', 'application/json')
      .set(
        'authorization',
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7Im5hbWUiOiJKb2huIERvZSIsImVtYWlsIjoiam9obkBkb2UuY29tIn0sImlhdCI6MTY0NzkzMTkyMCwiZXhwIjoxNjgzOTMxOTIwfQ.I1c-Ok28QL9v8tbpX-JOmayU2uN3iNaa3QC14O5aoow'
      )

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      email: expectedUser.email,
      name: expectedUser.name
    })
  })

  it('should not get authenticated user', async () => {
    const response = await request(app)
      .get('/api/auth/user/')
      .set('Accept', 'application/json')
      .set('authorization', 'Bearer invalid-token')

    expect(response.headers['content-type']).toMatch(/application\/json/)
    expect(response.status).toEqual(401)
    expect(response.body).toEqual({
      error: 'Unauthorized access'
    })
  })
})
