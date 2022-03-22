import GetAllVesselsImpl from '@/tracking/application/GetAllVesselsImpl'
import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'

const makeMockVesselRepository = (findAllFn?: () => Promise<Vessel[]>) =>
  jest.fn<IVesselRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(findAllFn),
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

const makeSUT = (findAllFn?: () => Promise<Vessel[]>) => {
  const MockVesselRepository = makeMockVesselRepository(findAllFn)
  const mockedVesselRepository = new MockVesselRepository()
  const getAllVessels = new GetAllVesselsImpl(mockedVesselRepository)
  return { mockedVesselRepository, getAllVessels }
}

describe('GetAllVesselsImpl', () => {
  it('should get all vessels', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, getAllVessels } = makeSUT(() =>
      Promise.resolve([expectedResult])
    )

    expect(getAllVessels.execute()).resolves.toEqual([expectedResult])
    expect(mockedVesselRepository.findAll).toBeCalledTimes(1)
    expect(mockedVesselRepository.findAll).toHaveReturned()
  })

  it('should not get all vessels when repository throw error', () => {
    const { mockedVesselRepository, getAllVessels } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(getAllVessels.execute()).rejects.toThrow()
    expect(mockedVesselRepository.findAll).toBeCalledTimes(1)
    expect(mockedVesselRepository.findAll).rejects.toThrow()
  })
})
