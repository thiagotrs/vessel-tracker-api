import VesselRepositoryInMem from '@/tracking/adapters/repositories/VesselRepositoryInMem'
import Vessel from '@/tracking/domain/Vessel'

const fakeVessel = (): Vessel => {
  const name = 'Atlantic Vessel 43'
  const ownership = 'Atantic Log Inc'
  const year = 1985
  const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

  return Vessel.create(name, ownership, year, portId)
}

describe('VesselRepositoryInMem', () => {
  it('should repository add vessel on save', async () => {
    const expectedResult = fakeVessel()
    const vesselRepository = new VesselRepositoryInMem([])

    await vesselRepository.save(expectedResult)

    expect(vesselRepository.vessels).toHaveLength(1)
    expect(vesselRepository.vessels).toContain(expectedResult)
  })

  it('should repository update vessel on save', async () => {
    const expectedResult = fakeVessel()
    const vesselRepository = new VesselRepositoryInMem([expectedResult])

    await vesselRepository.save(expectedResult)

    expect(vesselRepository.vessels).toHaveLength(1)
    expect(vesselRepository.vessels).toContain(expectedResult)
  })

  it('should repository find all vessels', async () => {
    const expectedResult = fakeVessel()
    const vesselRepository = new VesselRepositoryInMem([expectedResult])

    expect(vesselRepository.findAll()).resolves.toEqual(
      vesselRepository.vessels
    )
  })

  it('should repository find vessel by id', () => {
    const expectedResult = fakeVessel()
    const vesselRepository = new VesselRepositoryInMem([expectedResult])

    expect(vesselRepository.find(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
  })

  it('should repository not find vessel by id', () => {
    const invalidId = ''
    const vesselRepository = new VesselRepositoryInMem([])

    expect(vesselRepository.find(invalidId)).resolves.toBeNull()
  })
})
