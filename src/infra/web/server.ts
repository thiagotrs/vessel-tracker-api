import http from 'http'
import { App } from 'infra/web/app'
import { appConfig } from '../config/config'
import { connect } from '../data/connection'

process.on('unhandledRejection', (err) => {
  throw err
})

process.on('uncaughtException', (err) => {
  console.log(err)
  process.exit(1)
})

export default function run() {
  connect().then((connection) => {
    const port = appConfig.PORT
    const app = new App(connection).getApp()
    const server = http.createServer(app)
    server.listen(port, () =>
      console.log(`🏃 Server Up and Running on ::${port}`)
    )
  })
}
