import Stop from '@/tracking/domain/Stop'
import Vessel, { VesselStatus } from '@/tracking/domain/Vessel'

describe('Vessel', () => {
  it('should create vessel', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel = Vessel.create(name, ownership, year, portId)

    expect(vessel.name).toEqual(name)
    expect(vessel.ownership).toEqual(ownership)
    expect(vessel.status).toEqual(VesselStatus.PARKED)
    expect(vessel.year).toEqual(year)
    expect(vessel.currentStop).not.toBeNull()
    expect(vessel.previousStops).toHaveLength(0)
    expect(vessel.nextStops).toHaveLength(0)
    expect(vessel.id).not.toBeNull()
  })

  const table = [
    {
      name: '',
      ownership: 'Atantic Log Inc',
      year: 1985,
      portId: '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    },
    {
      name: 'Atlantic Vessel 43',
      ownership: '',
      year: 1985,
      portId: '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    },
    {
      name: 'Atlantic Vessel 43',
      ownership: 'Atantic Log Inc',
      year: 0,
      portId: '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    },
    {
      name: 'Atlantic Vessel 43',
      ownership: 'Atantic Log Inc',
      year: 1985,
      portId: ''
    }
  ]

  it.each(table)(
    'should not create vessel %s',
    ({ name, ownership, year, portId }) => {
      expect(() => Vessel.create(name, ownership, year, portId)).toThrow()
    }
  )

  it('should load vessel', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const status = VesselStatus.PARKED
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const currentStop = Stop.create(portId)
    const previousStops: Stop[] = []
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

    expect(vessel.id).toEqual(id)
    expect(vessel.name).toEqual(name)
    expect(vessel.ownership).toEqual(ownership)
    expect(vessel.status).toEqual(status)
    expect(vessel.year).toEqual(year)
    expect(vessel.currentStop).toEqual(currentStop)
    expect(vessel.previousStops).toHaveLength(0)
    expect(vessel.nextStops).toHaveLength(0)
  })

  it('should not load vessel when has not current and previous stop', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const status = VesselStatus.PARKED
    const year = 1985
    const currentStop = null
    const previousStops: Stop[] = []
    const nextStops: Stop[] = []

    const vesselFn = () =>
      Vessel.of(
        id,
        name,
        ownership,
        status,
        year,
        currentStop,
        previousStops,
        nextStops
      )

    expect(vesselFn).toThrow()
  })

  it('should vessel has unique id on create', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel1 = Vessel.create(name, ownership, year, portId)
    const vessel2 = Vessel.create(name, ownership, year, portId)

    expect(vessel1.id).not.toEqual(vessel2.id)
  })

  it('should vessel do not dock when parked', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel = Vessel.create(name, ownership, year, portId)

    expect(() => vessel.dock()).toThrow()
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

    expect(() => vessel.dock()).toThrow()
  })

  it('should vessel dock when has next stop', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const status = VesselStatus.SAILING
    const year = 1985

    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const lastStop = Stop.create(portId)
    lastStop.registerDateIn()
    lastStop.registerDateOut()

    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const nextStop = Stop.create(nextPortId)

    const currentStop = null
    const previousStops: Stop[] = [lastStop]
    const nextStops: Stop[] = [nextStop]

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

    vessel.dock()

    expect(vessel.status).toEqual(VesselStatus.PARKED)
    expect(vessel.currentStop).not.toBeNull()
    expect(vessel.previousStops).toContain(lastStop)
    expect(vessel.nextStops).toHaveLength(0)
  })

  it('should vessel undock when parked', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel = Vessel.create(name, ownership, year, portId)
    const stop = vessel.currentStop

    vessel.undock()

    expect(vessel.status).toEqual(VesselStatus.SAILING)
    expect(vessel.currentStop).toBeNull()
    expect(vessel.previousStops).toContain(stop)
  })

  it('should vessel do not undock when sailing', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const status = VesselStatus.SAILING
    const year = 1985

    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'
    const lastStop = Stop.create(portId)
    lastStop.registerDateIn()
    lastStop.registerDateOut()

    const nextPortId = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const nextStop = Stop.create(nextPortId)

    const currentStop = null
    const previousStops: Stop[] = [lastStop]
    const nextStops: Stop[] = [nextStop]

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

    expect(() => vessel.undock()).toThrow()
  })

  it('should vessel replace all next stops', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel = Vessel.create(name, ownership, year, portId)

    const portId2 = '42fa29a0-32e0-41b6-a6e7-6353bbcdc1cb'
    const nextStop = Stop.create(portId2)

    vessel.replaceAllNextStops([nextStop])

    expect(vessel.nextStops).toContainEqual(nextStop)
  })

  it('should vessel do not replace all next stops', () => {
    const name = 'Atlantic Vessel 43'
    const ownership = 'Atantic Log Inc'
    const year = 1985
    const portId = '229be4db-c7f3-43a7-96cd-f171b0a5a996'

    const vessel = Vessel.create(name, ownership, year, portId)

    const nextStop = Stop.create(portId)

    const replaceAllNextStopsFn = () => vessel.replaceAllNextStops([nextStop])

    expect(replaceAllNextStopsFn).toThrow()
  })
})
