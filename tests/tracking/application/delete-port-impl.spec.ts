import DeletePortImpl from '@/tracking/application/DeletePortImpl'
import IPortRepository from '@/tracking/application/port/IPortRepository'
import Port from '@/tracking/domain/Port'

const makeMockPortRepository = (
  findFn?: (id: string) => Promise<Port | null>,
  deleteFn?: (port: Port) => Promise<void>
) =>
  jest.fn<IPortRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(findFn),
    findAll: jest.fn(),
    delete: jest.fn(deleteFn)
  }))

const fakePort = (): Port => {
  const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'Rio Port'
  const capacity = 200
  const country = 'Brazil'
  const city = 'Rio de Janeiro'
  const coordinates: [number, number] = [-22.8918072, -43.2164655]
  return Port.of(id, name, capacity, country, city, coordinates)
}

const makeSUT = (
  findFn?: (id: string) => Promise<Port | null>,
  deleteFn?: (port: Port) => Promise<void>
) => {
  const MockPortRepository = makeMockPortRepository(findFn, deleteFn)
  const mockedPortRepository = new MockPortRepository()
  const deletePort = new DeletePortImpl(mockedPortRepository)
  return { mockedPortRepository, deletePort }
}

describe('DeletePortImpl', () => {
  it('should delete port', async () => {
    const expectedResult = fakePort()
    const { mockedPortRepository, deletePort } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve()
    )

    const result = await deletePort.execute(expectedResult.id)

    expect(result).toBeUndefined()
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.delete).toBeCalledTimes(1)
  })

  it('should not delete port when repository throw error', () => {
    const expectedResult = fakePort()
    const { mockedPortRepository, deletePort } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(deletePort.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.find).rejects.toThrow()
    expect(mockedPortRepository.delete).not.toBeCalled()
  })

  it('should not delete port when repository throw error', () => {
    const expectedResult = fakePort()
    const { mockedPortRepository, deletePort } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.reject(new Error('Repository Error'))
    )

    expect(deletePort.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.delete).rejects.toThrow()
  })

  it('should not delete port when invalid id', () => {
    const invalidId = ''
    const { mockedPortRepository, deletePort } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(deletePort.execute(invalidId)).rejects.toThrow()
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.delete).not.toBeCalled()
  })
})
