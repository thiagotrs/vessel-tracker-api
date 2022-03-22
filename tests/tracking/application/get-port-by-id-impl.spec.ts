import GetPortByIdImpl from '@/tracking/application/GetPortByIdImpl'
import IPortRepository from '@/tracking/application/port/IPortRepository'
import Port from '@/tracking/domain/Port'

const makeMockPortRepository = (
  findFn?: (id: string) => Promise<Port | null>
) =>
  jest.fn<IPortRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(findFn),
    findAll: jest.fn(),
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

const makeSUT = (findFn?: (id: string) => Promise<Port | null>) => {
  const MockPortRepository = makeMockPortRepository(findFn)
  const mockedPortRepository = new MockPortRepository()
  const getPortById = new GetPortByIdImpl(mockedPortRepository)
  return { mockedPortRepository, getPortById }
}

describe('GetPortByIdImpl', () => {
  it('should get port', () => {
    const expectedResult = fakePort()
    const { mockedPortRepository, getPortById } = makeSUT(() =>
      Promise.resolve(expectedResult)
    )

    expect(getPortById.execute(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.find).toBeCalledWith(expectedResult.id)
    expect(mockedPortRepository.find).toHaveReturned()
  })

  it('should not get port when invalid id', () => {
    const invalidId = ''
    const { mockedPortRepository, getPortById } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(getPortById.execute(invalidId)).rejects.toThrow()
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.find).toBeCalledWith(invalidId)
    expect(mockedPortRepository.find).toHaveReturned()
  })

  it('should not get port when port repository throw error', () => {
    const expectedResult = fakePort()
    const { mockedPortRepository, getPortById } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(getPortById.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedPortRepository.find).toBeCalledTimes(1)
    expect(mockedPortRepository.find).toBeCalledWith(expectedResult.id)
    expect(mockedPortRepository.find).rejects.toThrow()
  })
})
