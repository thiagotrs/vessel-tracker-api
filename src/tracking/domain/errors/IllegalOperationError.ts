export default class IllegalOperationError extends Error {
  constructor(message = 'Illegal Operation') {
    super(message)
  }
}
