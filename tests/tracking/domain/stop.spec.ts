import Stop from '@/tracking/domain/Stop'

describe('Stop', () => {
  it('should create stop', () => {
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const stop = Stop.create(portId)

    expect(stop.id).not.toBeNull()
    expect(stop.portId).toEqual(portId)
    expect(stop.dateIn).toBeNull()
    expect(stop.dateOut).toBeNull()
  })

  it('should not create stop when invalid input', () => {
    const invalidPortId = ''

    const stopFn = () => Stop.create(invalidPortId)

    expect(stopFn).toThrow()
  })

  it('should load stop', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const dateIn = null
    const dateOut = null

    const stop = Stop.of(id, portId, dateIn, dateOut)

    expect(stop.id).toEqual(id)
    expect(stop.portId).toEqual(portId)
    expect(stop.dateIn).toEqual(dateIn)
    expect(stop.dateOut).toEqual(dateOut)
  })

  it('should not load stop when invalid input', () => {
    const id = ''
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const dateIn = null
    const dateOut = null

    const stopFn = () => Stop.of(id, portId, dateIn, dateOut)

    expect(stopFn).toThrow()
  })

  it('should not load stop when dateIn was registered after dateOut', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const dateOut = new Date()
    const dateIn = new Date(dateOut.getDate() + 1)

    const stopFn = () => Stop.of(id, portId, dateIn, dateOut)

    expect(stopFn).toThrow()
  })

  it('should not load stop when dateIn was registered after dateOut', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const dateIn = null
    const dateOut = new Date()

    const stopFn = () => Stop.of(id, portId, dateIn, dateOut)

    expect(stopFn).toThrow()
  })

  it('should stop has unique id on create', () => {
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const stop1 = Stop.create(portId)
    const stop2 = Stop.create(portId)

    expect(stop1.id).not.toEqual(stop2.id)
  })

  it('should stop register DateIn', () => {
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const stop = Stop.create(portId)
    stop.registerDateIn()

    expect(stop.dateIn).not.toBeNull()
  })

  it('should stop register DateOut', () => {
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const stop = Stop.create(portId)
    stop.registerDateIn()
    stop.registerDateOut()

    expect(stop.dateOut).not.toBeNull()
  })

  it('should stop do not register DateIn after DateOut', () => {
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const stop = Stop.create(portId)
    stop.registerDateIn()
    stop.registerDateOut()

    expect(() => stop.registerDateIn()).toThrow()
  })

  it('should stop do not register DateOut before DateIn', () => {
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const stop = Stop.create(portId)

    expect(() => stop.registerDateOut()).toThrow()
  })
})
