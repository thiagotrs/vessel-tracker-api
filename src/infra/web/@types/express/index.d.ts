import { PayloadDto } from '@/auth/application/dto/PayloadDto'

declare module 'express-serve-static-core' {
  export interface Request {
    payloadToken?: PayloadDto
  }
}
