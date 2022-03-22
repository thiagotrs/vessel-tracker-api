export default class ForbiddenError extends Error {
  constructor(message = 'Forbidden access') {
    super(message)
  }
}
