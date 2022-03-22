import PortRepositoryInMem from '@/tracking/adapters/repositories/PortRepositoryInMem'
import GetPortByIdImpl from '@/tracking/application/GetPortByIdImpl'
import Port from '@/tracking/domain/Port'

const fakePort = (): Port => {
  const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'Rio Port'
  const capacity = 200
  const country = 'Brazil'
  const city = 'Rio de Janeiro'
  const coordinates: [number, number] = [-22.8918072, -43.2164655]
  return Port.of(id, name, capacity, country, city, coordinates)
}

const makeSUT = (initPorts: Port[]) => {
  const portRepository = new PortRepositoryInMem(initPorts)
  const getPortById = new GetPortByIdImpl(portRepository)
  const spiedFindPortRepository = jest.spyOn(portRepository, 'find')
  return { spiedFindPortRepository, getPortById }
}

describe('GetPortByIdImpl integrated with PortRepository', () => {
  it('should get port', async () => {
    const expectedResult = fakePort()
    const { spiedFindPortRepository, getPortById } = makeSUT([expectedResult])

    expect(getPortById.execute(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
    expect(spiedFindPortRepository).toBeCalledTimes(1)
    expect(spiedFindPortRepository).toBeCalledWith(expectedResult.id)
    expect(spiedFindPortRepository).toHaveReturned()
  })

  it('should not get port when invalid id', () => {
    const invalidId = ''
    const { spiedFindPortRepository, getPortById } = makeSUT([])

    expect(getPortById.execute(invalidId)).rejects.toThrow()
    expect(spiedFindPortRepository).toBeCalledTimes(1)
    expect(spiedFindPortRepository).toBeCalledWith(invalidId)
    expect(spiedFindPortRepository).toHaveReturned()
  })

  it('should not get port when port repository throw error', () => {
    const expectedResult = fakePort()
    const { spiedFindPortRepository, getPortById } = makeSUT([])

    spiedFindPortRepository.mockImplementation(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(getPortById.execute(expectedResult.id)).rejects.toThrow()
    expect(spiedFindPortRepository).toBeCalledTimes(1)
    expect(spiedFindPortRepository).toBeCalledWith(expectedResult.id)
    expect(spiedFindPortRepository).rejects.toThrow()
  })
})
