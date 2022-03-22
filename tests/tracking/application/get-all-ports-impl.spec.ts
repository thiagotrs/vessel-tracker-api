import GetAllPortsImpl from '@/tracking/application/GetAllPortsImpl'
import IPortRepository from '@/tracking/application/port/IPortRepository'
import Port from '@/tracking/domain/Port'

const makeMockPortRepository = (findAllFn?: () => Promise<Port[]>) =>
  jest.fn<IPortRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(findAllFn),
    delete: jest.fn()
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

const makeSUT = (findAllFn?: () => Promise<Port[]>) => {
  const MockPortRepository = makeMockPortRepository(findAllFn)
  const mockedPortRepository = new MockPortRepository()
  const getAllPorts = new GetAllPortsImpl(mockedPortRepository)
  return { mockedPortRepository, getAllPorts }
}

describe('GetAllPortsImpl', () => {
  it('should get all ports', () => {
    const expectedResult = fakePort()
    const { mockedPortRepository, getAllPorts } = makeSUT(() =>
      Promise.resolve([expectedResult])
    )

    expect(getAllPorts.execute()).resolves.toEqual([expectedResult])
    expect(mockedPortRepository.findAll).toBeCalledTimes(1)
    expect(mockedPortRepository.findAll).toHaveReturned()
  })

  it('should not get all ports when repository throw error', () => {
    const { mockedPortRepository, getAllPorts } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(getAllPorts.execute()).rejects.toThrow()
    expect(mockedPortRepository.findAll).toBeCalledTimes(1)
    expect(mockedPortRepository.findAll).rejects.toThrow()
  })
})
