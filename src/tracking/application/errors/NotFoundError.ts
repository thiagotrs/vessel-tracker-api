export default class NotFoundError extends Error {
  constructor(message = 'Not Found') {
    super(message)
  }
}
