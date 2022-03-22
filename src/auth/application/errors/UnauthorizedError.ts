export default class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message)
  }
}
