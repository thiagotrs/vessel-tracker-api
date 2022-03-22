import GetVesselByIdImpl from '@/tracking/application/GetVesselByIdImpl'
import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'

const makeMockVesselRepository = (findFn?: () => Promise<Vessel | null>) =>
  jest.fn<IVesselRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(findFn),
    findAll: jest.fn(),
    delete: jest.fn()
  }))

const fakeVessel = (): Vessel => {
  const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'Atlantic Vessel 43'
  const ownership = 'Atantic Log Inc'
  const status = VesselStatus.PARKED
  const year = 1985
  const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
  const currentStop = Stop.create(portId)
  const previousStops: Stop[] = []
  const nextStops: Stop[] = []

  return Vessel.of(
    id,
    name,
    ownership,
    status,
    year,
    currentStop,
    previousStops,
    nextStops
  )
}

const makeSUT = (findFn?: () => Promise<Vessel | null>) => {
  const MockVesselRepository = makeMockVesselRepository(findFn)
  const mockedVesselRepository = new MockVesselRepository()
  const getVesselById = new GetVesselByIdImpl(mockedVesselRepository)
  return { mockedVesselRepository, getVesselById }
}

describe('GetVesselByIdImpl', () => {
  it('should get port', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, getVesselById } = makeSUT(() =>
      Promise.resolve(expectedResult)
    )

    expect(getVesselById.execute(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).toBeCalledWith(expectedResult.id)
    expect(mockedVesselRepository.find).toHaveReturned()
  })

  it('should not get port when invalid id', () => {
    const invalidId = ''
    const { mockedVesselRepository, getVesselById } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(getVesselById.execute(invalidId)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).toBeCalledWith(invalidId)
    expect(mockedVesselRepository.find).toHaveReturned()
  })

  it('should not get port when port repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, getVesselById } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(getVesselById.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).toBeCalledWith(expectedResult.id)
    expect(mockedVesselRepository.find).rejects.toThrow()
  })
})
