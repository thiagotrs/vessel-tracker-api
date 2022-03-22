import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import ReplaceAllNextStopsImpl from '@/tracking/application/ReplaceAllNextStops'
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
  const replaceAllNextStops = new ReplaceAllNextStopsImpl(
    mockedVesselRepository
  )
  return { mockedVesselRepository, replaceAllNextStops }
}

describe('ReplaceAllNextStopsImpl', () => {
  it('should replace next vessel stops', async () => {
    const expectedResult = fakeVessel()
    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve()
    )

    const result = await replaceAllNextStops.execute(expectedResult.id, [
      nextPortId
    ])

    expect(result).toBeUndefined()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).toBeCalledTimes(1)
  })

  it('should not replace next vessel stops when repository throw error', () => {
    const expectedResult = fakeVessel()
    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(
      replaceAllNextStops.execute(expectedResult.id, [nextPortId])
    ).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).rejects.toThrow()
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should not replace next vessel stops when repository throw error', () => {
    const expectedResult = fakeVessel()
    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.reject(new Error('Repository Error'))
    )

    expect(
      replaceAllNextStops.execute(expectedResult.id, [nextPortId])
    ).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).rejects.toThrow()
  })

  it('should not replace next vessel stops when invalid id', () => {
    const invalidId = ''
    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(
      replaceAllNextStops.execute(invalidId, [nextPortId])
    ).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should not replace next vessel stops when invalid port id', () => {
    const expectedResult = fakeVessel()
    const invalidNextPortId = ''
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(() =>
      Promise.resolve(expectedResult)
    )

    expect(
      replaceAllNextStops.execute(expectedResult.id, [invalidNextPortId])
    ).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should not replace next vessel stops when invalid port ids are same', () => {
    const expectedResult = fakeVessel()
    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(() =>
      Promise.resolve(expectedResult)
    )

    expect(
      replaceAllNextStops.execute(expectedResult.id, [nextPortId, nextPortId])
    ).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })

  it('should not replace next vessel stops when invalid port ids are same', async () => {
    const expectedResult = fakeVessel()
    const lastStop =
      expectedResult.previousStops[expectedResult.previousStops.length - 1]
    const { mockedVesselRepository, replaceAllNextStops } = makeSUT(() =>
      Promise.resolve(expectedResult)
    )

    expect(() =>
      replaceAllNextStops.execute(expectedResult.id, [lastStop.portId])
    ).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).not.toBeCalled()
  })
})
