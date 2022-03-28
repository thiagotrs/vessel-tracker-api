import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config({
    path: path.resolve(process.cwd(), `${process.env.NODE_ENV}.env`)
  })

  if (result.error) {
    throw result.error
  }
}

export const appConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.APP_HOST || 'localhost',
  PORT: parseInt(process.env.APP_PORT + '') || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret',
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN + '') || 3600
}
