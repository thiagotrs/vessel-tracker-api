import CreateVesselImpl from '@/tracking/application/CreateVesselImpl'
import IVesselRepository from '@/tracking/application/port/IVesselRepository'
import Vessel from '@/tracking/domain/Vessel'

const makeMockVesselRepository = (saveFn?: (vessel: Vessel) => Promise<void>) =>
  jest.fn<IVesselRepository, any[]>(() => ({
    save: jest.fn(saveFn),
    find: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn()
  }))

const makeSUT = (saveFn?: (vessel: Vessel) => Promise<void>) => {
  const MockVesselRepository = makeMockVesselRepository(saveFn)
  const mockedVesselRepository = new MockVesselRepository()
  const createVessel = new CreateVesselImpl(mockedVesselRepository)
  return { mockedVesselRepository, createVessel }
}

describe('CreateVesselImpl', () => {
  it('should create port', () => {
    const { mockedVesselRepository, createVessel } = makeSUT(() =>
      Promise.resolve()
    )

    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    expect(
      createVessel.execute(name, ownership, year, portId)
    ).resolves.toBeUndefined()
    expect(mockedVesselRepository.save).toBeCalledTimes(1)
  })

  it('should not create port when repository throw error', () => {
    const { mockedVesselRepository, createVessel } = makeSUT(() =>
      Promise.reject(new Error('Repository Error'))
    )

    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    expect(
      createVessel.execute(name, ownership, year, portId)
    ).rejects.toThrow()
    expect(mockedVesselRepository.save).toBeCalledTimes(1)
    expect(mockedVesselRepository.save).rejects.toThrow()
  })

  it('should not create port when invalid inputs', () => {
    const { mockedVesselRepository, createVessel } = makeSUT()

    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = ''

    expect(
      createVessel.execute(name, ownership, year, portId)
    ).rejects.toThrow()
    expect(mockedVesselRepository.save).toBeCalledTimes(0)
  })
})
