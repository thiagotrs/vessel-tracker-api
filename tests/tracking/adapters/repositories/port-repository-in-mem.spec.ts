import PortRepositoryInMem from '@/tracking/adapters/repositories/PortRepositoryInMem'
import Port from '@/tracking/domain/Port'

const fakePort = (expectedId?: string): Port => {
  const id = expectedId || '3f576b45-675d-4df7-96f0-2e35c6310780'
  const name = 'Rio Port'
  const capacity = 200
  const country = 'Brazil'
  const city = 'Rio de Janeiro'
  const coordinates: [number, number] = [-22.8918072, -43.2164655]
  return Port.of(id, name, capacity, country, city, coordinates)
}

describe('PortRepositoryInMem', () => {
  it('should repository add port on save', async () => {
    const expectedResult = fakePort()
    const portRepository = new PortRepositoryInMem([])

    await portRepository.save(expectedResult)

    expect(portRepository.ports).toHaveLength(1)
    expect(portRepository.ports).toContain(expectedResult)
  })

  it('should repository update port on save', async () => {
    const expectedResult = fakePort()
    const portRepository = new PortRepositoryInMem([expectedResult])

    await portRepository.save(expectedResult)

    expect(portRepository.ports).toHaveLength(1)
    expect(portRepository.ports).toContain(expectedResult)
  })

  it('should repository find all ports', async () => {
    const expectedResult = fakePort()
    const portRepository = new PortRepositoryInMem([expectedResult])

    expect(portRepository.findAll()).resolves.toEqual(portRepository.ports)
  })

  it('should repository find port by id', () => {
    const expectedResult = fakePort()
    const portRepository = new PortRepositoryInMem([expectedResult])

    expect(portRepository.find(expectedResult.id)).resolves.toEqual(
      expectedResult
    )
  })

  it('should repository not find port by id', () => {
    const invalidId = ''
    const portRepository = new PortRepositoryInMem([])

    expect(portRepository.find(invalidId)).resolves.toBeNull()
  })
})
