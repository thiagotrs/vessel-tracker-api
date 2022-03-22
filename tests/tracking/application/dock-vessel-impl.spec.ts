import DockVesselImpl from '@/tracking/application/DockVesselImpl'
import IVesselRepository from '@/tracking/application/port/IVesselRepository'
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
  const status = VesselStatus.SAILING
  const year = 1985
  const currentStop = null

  const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
  const previousStop = Stop.create(portId)
  previousStop.registerDateIn()
  previousStop.registerDateOut()
  const previousStops: Stop[] = [previousStop]

  const portId2 = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
  const nextStop = Stop.create(portId2)
  const nextStops: Stop[] = [nextStop]

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
  const dockVessel = new DockVesselImpl(mockedVesselRepository)
  return { mockedVesselRepository, dockVessel }
}

describe('DockVesselImpl', () => {
  it('should dock vessel', async () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, dockVessel } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve()
    )

    const result = await dockVessel.execute(expectedResult.id)

    expect(result).toBeUndefined()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).toBeCalledTimes(1)
  })

  it('should not dock vessel when repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, dockVessel } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(dockVessel.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).rejects.toThrow()
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should not dock vessel when repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, dockVessel } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.reject(new Error('Repository Error'))
    )

    expect(dockVessel.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).rejects.toThrow()
  })

  it('should not dock vessel when invalid id', () => {
    const invalidId = ''
    const { mockedVesselRepository, dockVessel } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(dockVessel.execute(invalidId)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should vessel do not dock when parked', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel = Vessel.create(name, ownership, year, portId)

    const { mockedVesselRepository, dockVessel } = makeSUT(() =>
      Promise.resolve(vessel)
    )

    expect(dockVessel.execute(vessel.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should vessel do not dock when has not next stop', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const status = VesselStatus.SAILING
    const year = 1985

    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const lastStop = Stop.create(portId)
    lastStop.registerDateIn()
    lastStop.registerDateOut()

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

    const { mockedVesselRepository, dockVessel } = makeSUT(() =>
      Promise.resolve(vessel)
    )

    expect(dockVessel.execute(vessel.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })
})
