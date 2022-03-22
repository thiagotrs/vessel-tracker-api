import CreatePortImpl from '@/tracking/application/CreatePortImpl'
import IPortRepository from '@/tracking/application/port/IPortRepository'
import Port from '@/tracking/domain/Port'

const makeMockPortRepository = (saveFn?: (port: Port) => Promise<void>) =>
  jest.fn<IPortRepository, any[]>(() => ({
    save: jest.fn(saveFn),
    find: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn()
  }))

const makeSUT = (saveFn?: (port: Port) => Promise<void>) => {
  const MockPortRepository = makeMockPortRepository(saveFn)
  const mockedPortRepository = new MockPortRepository()
  const createPort = new CreatePortImpl(mockedPortRepository)
  return { mockedPortRepository, createPort }
}

describe('CreatePortImpl', () => {
  it('should create port', () => {
    const { mockedPortRepository, createPort } = makeSUT(() =>
      Promise.resolve()
    )

    const name = 'Rio Port'
    const capacity = 200
    const country = 'Brazil'
    const city = 'Rio de Janeiro'
    const coordinates: [number, number] = [-22.8918072, -43.2164655]

    expect(
      createPort.execute(name, capacity, country, city, coordinates)
    ).resolves.toBeUndefined()
    expect(mockedPortRepository.save).toBeCalledTimes(1)
  })

  it('should not create port when repository throw error', () => {
    const { mockedPortRepository, createPort } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    const name = 'Rio Port'
    const capacity = 200
    const country = 'Brazil'
    const city = 'Rio de Janeiro'
    const coordinates: [number, number] = [-22.8918072, -43.2164655]

    expect(
      createPort.execute(name, capacity, country, city, coordinates)
    ).rejects.toThrow()
    expect(mockedPortRepository.save).toBeCalledTimes(1)
    expect(mockedPortRepository.save).rejects.toThrow()
  })

  it('should not create port when invalid inputs', () => {
    const { mockedPortRepository, createPort } = makeSUT()

    const name = 'Rio Port'
    const capacity = 0
    const country = 'Brazil'
    const city = 'Rio de Janeiro'
    const coordinates: [number, number] = [-22.8918072, -43.2164655]

    expect(
      createPort.execute(name, capacity, country, city, coordinates)
    ).rejects.toThrow()
    expect(mockedPortRepository.save).toBeCalledTimes(0)
  })
})
