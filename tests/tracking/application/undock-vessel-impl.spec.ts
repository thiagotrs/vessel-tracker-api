import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import UndockVesselImpl from '@/tracking/application/UndockVesselImpl'
import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'

const makeMockVesselRepository = (
  findFn?: () => Promise<Vessel | null>,
  saveFn?: (vessel: Vessel) => Promise<void>
) =>
  jest.fn<IVesselRepository, any[]>(() => ({
    save: jest.fn(saveFn),
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
  currentStop.registerDateIn()
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

const makeSUT = (
  findFn?: () => Promise<Vessel | null>,
  saveFn?: (vessel: Vessel) => Promise<void>
) => {
  const MockVesselRepository = makeMockVesselRepository(findFn, saveFn)
  const mockedVesselRepository = new MockVesselRepository()
  const undockVessel = new UndockVesselImpl(mockedVesselRepository)
  return { mockedVesselRepository, undockVessel }
}

describe('UndockVesselImpl', () => {
  it('should undock vessel', async () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, undockVessel } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve()
    )

    const result = await undockVessel.execute(expectedResult.id)

    expect(result).toBeUndefined()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).toBeCalledTimes(1)
  })

  it('should not undock vessel when repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, undockVessel } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(undockVessel.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).rejects.toThrow()
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should not undock vessel when repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, undockVessel } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.reject(new Error('Repository Error'))
    )

    expect(undockVessel.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).rejects.toThrow()
  })

  it('should not undock vessel when invalid id', () => {
    const invalidId = ''
    const { mockedVesselRepository, undockVessel } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(undockVessel.execute(invalidId)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should vessel do not undock when sailing', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const status = VesselStatus.SAILING
    const year = 1985

    const stopId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const dateIn = new Date()
    const dateOut = new Date(dateIn.getDate() + 1)
    const lastStop = Stop.of(stopId, portId, dateIn, dateOut)

    const currentStop = null
    const previousStops: Stop[] = [lastStop]
    const nextStops: Stop[] = []

    const vessel = Vessel.of(
      id,
      name,
      ownership,
      status,
      year,
      currentStop,
      previousStops,
      nextStops
    )

    const { mockedVesselRepository, undockVessel } = makeSUT(() =>
      Promise.resolve(vessel)
    )

    expect(undockVessel.execute(id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })
})
