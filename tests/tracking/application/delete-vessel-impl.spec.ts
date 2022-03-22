import DeleteVesselImpl from '@/tracking/application/DeleteVesselImpl'
import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'

const makeMockVesselRepository = (
  findFn?: () => Promise<Vessel | null>,
  deleteFn?: (vessel: Vessel) => Promise<void>
) =>
  jest.fn<IVesselRepository, any[]>(() => ({
    save: jest.fn(),
    find: jest.fn(findFn),
    findAll: jest.fn(),
    delete: jest.fn(deleteFn)
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

const makeSUT = (
  findFn?: () => Promise<Vessel | null>,
  deleteFn?: (vessel: Vessel) => Promise<void>
) => {
  const MockVesselRepository = makeMockVesselRepository(findFn, deleteFn)
  const mockedVesselRepository = new MockVesselRepository()
  const deleteVessel = new DeleteVesselImpl(mockedVesselRepository)
  return { mockedVesselRepository, deleteVessel }
}

describe('DeleteVesselImpl', () => {
  it('should delete vessel', async () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, deleteVessel } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.resolve()
    )

    const result = await deleteVessel.execute(expectedResult.id)

    expect(result).toBeUndefined()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.delete).toBeCalledTimes(1)
  })

  it('should not delete vessel when repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, deleteVessel } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(deleteVessel.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.find).rejects.toThrow()
    expect(mockedVesselRepository.delete).not.toBeCalled()
  })

  it('should not delete vessel when repository throw error', () => {
    const expectedResult = fakeVessel()
    const { mockedVesselRepository, deleteVessel } = makeSUT(
      () => Promise.resolve(expectedResult),
      () => Promise.reject(new Error('Repository Error'))
    )

    expect(deleteVessel.execute(expectedResult.id)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.delete).rejects.toThrow()
  })

  it('should not delete vessel when invalid id', () => {
    const invalidId = ''
    const { mockedVesselRepository, deleteVessel } = makeSUT(() =>
      Promise.resolve(null)
    )

    expect(deleteVessel.execute(invalidId)).rejects.toThrow()
    expect(mockedVesselRepository.find).toBeCalledTimes(1)
    expect(mockedVesselRepository.delete).not.toBeCalled()
  })
})
