import VesselRepositoryInMem from '@/tracking/adapters/repositories/VesselRepositoryInMem'
import GetVesselByIdImpl from '@/tracking/application/GetVesselByIdImpl'
import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'

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

const makeSUT = (initVessels: Vessel[]) => {
  const portRepository = new VesselRepositoryInMem(initVessels)
  const getVesselById = new GetVesselByIdImpl(portRepository)
  const spiedFindVesselRepository = jest.spyOn(portRepository, 'find')
  return { spiedFindVesselRepository, getVesselById }
}

describe('GetVesselByIdImpl integrated with VesselRepository', () => {
  it('should get port', async () => {
    const expectedResult = fakeVessel()
    const { spiedFindVesselRepository, getVesselById } = makeSUT([
      expectedResult
    ])

    expect(getVesselById.execute(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
    expect(spiedFindVesselRepository).toBeCalledTimes(1)
    expect(spiedFindVesselRepository).toBeCalledWith(expectedResult.id)
    expect(spiedFindVesselRepository).toHaveReturned()
  })

  it('should not get port when invalid id', () => {
    const invalidId = ''
    const { spiedFindVesselRepository, getVesselById } = makeSUT([])

    expect(getVesselById.execute(invalidId)).rejects.toThrow()
    expect(spiedFindVesselRepository).toBeCalledTimes(1)
    expect(spiedFindVesselRepository).toBeCalledWith(invalidId)
    expect(spiedFindVesselRepository).toHaveReturned()
  })

  it('should not get port when port repository throw error', () => {
    const expectedResult = fakeVessel()
    const { spiedFindVesselRepository, getVesselById } = makeSUT([])

    spiedFindVesselRepository.mockImplementation(() =>
      Promise.reject(new Error('Repository Error'))
    )

    expect(getVesselById.execute(expectedResult.id)).rejects.toThrow()
    expect(spiedFindVesselRepository).toBeCalledTimes(1)
    expect(spiedFindVesselRepository).toBeCalledWith(expectedResult.id)
    expect(spiedFindVesselRepository).rejects.toThrow()
  })
})
