import UnauthorizedError from '@/auth/application/errors/UnauthorizedError'
import IIsAuthenticated from '@/auth/application/port/IIsAuthenticated'
import ISigninUser from '@/auth/application/port/ISigninUser'
import ISignupUser from '@/auth/application/port/ISignupUser'
import { NextFunction, Request, Response } from 'express'

export default class AuthController {
  private readonly signinUser: ISigninUser
  private readonly signupUser: ISignupUser
  private readonly isUserAuthenticated: IIsAuthenticated

  constructor(
    signinUser: ISigninUser,
    signupUser: ISignupUser,
    isUserAuthenticated: IIsAuthenticated
  ) {
    this.signinUser = signinUser
    this.signupUser = signupUser
    this.isUserAuthenticated = isUserAuthenticated
  }

  async signin(req: Request, res: Response): Promise<Response> {
    const { email, pass } = req.body
    const token = await this.signinUser.execute(email, pass)
    return res.status(201).json(token)
  }

  async signup(req: Request, res: Response): Promise<Response> {
    const { name, email, pass } = req.body
    const token = await this.signupUser.execute(name, email, pass)
    return res.status(201).json(token)
  }

  async isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new UnauthorizedError('Empty Token')

    const payloadDto = await this.isUserAuthenticated.execute(token)
    req.payloadToken = payloadDto

    next()
  }

  async getAuthenticatedUser(req: Request, res: Response): Promise<Response> {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) throw new UnauthorizedError()

    const payloadToken = await this.isUserAuthenticated.execute(token)
    // const payloadToken = req.payloadToken
    return res.status(200).json(payloadToken)
  }
}
