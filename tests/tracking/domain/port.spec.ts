import Port from '@/tracking/domain/Port'

describe('Port', () => {
  it('should create port', () => {
    const name = 'Rio Port'
    const capacity = 200
    const country = 'Brazil'
    const city = 'Rio de Janeiro'
    const coordinates: [number, number] = [-22.8918072, -43.2164655]

    const port = Port.create(name, capacity, country, city, coordinates)

    expect(port.name).toEqual(name)
    expect(port.capacity).toEqual(capacity)
    expect(port.country).toEqual(country)
    expect(port.city).toEqual(city)
    expect(port.coordinates).toEqual(coordinates)
    expect(port.id).not.toBeNull()
  })

  it('should load port', () => {
    const id = '3f576b45-675d-4df7-96f0-2e35c6310780'
    const name = 'Rio Port'
    const capacity = 200
    const country = 'Brazil'
    const city = 'Rio de Janeiro'
    const coordinates: [number, number] = [-22.8918072, -43.2164655]

    const port = Port.of(id, name, capacity, country, city, coordinates)

    expect(port.id).toEqual(id)
    expect(port.name).toEqual(name)
    expect(port.capacity).toEqual(capacity)
    expect(port.country).toEqual(country)
    expect(port.city).toEqual(city)
    expect(port.coordinates).toEqual(coordinates)
  })

  const table = [
    {
      id: '',
      name: 'Rio Port',
      capacity: 200,
      country: 'Brazil',
      city: 'Rio de Janeiro',
      coordinates: [-22.8918072, -43.2164655]
    },
    {
      id: '3f576b45-675d-4df7-96f0-2e35c6310780',
      name: '',
      capacity: 200,
      country: 'Brazil',
      city: 'Rio de Janeiro',
      coordinates: [-22.8918072, -43.2164655]
    },
    {
      id: '3f576b45-675d-4df7-96f0-2e35c6310780',
      name: 'Rio Port',
      capacity: 0,
      country: 'Brazil',
      city: 'Rio de Janeiro',
      coordinates: [-22.8918072, -43.2164655]
    },
    {
      id: '3f576b45-675d-4df7-96f0-2e35c6310780',
      name: 'Rio Port',
      capacity: 200,
      country: '',
      city: 'Rio de Janeiro',
      coordinates: [-22.8918072, -43.2164655]
    },
    {
      id: '3f576b45-675d-4df7-96f0-2e35c6310780',
      name: 'Rio Port',
      capacity: 200,
      country: 'Brazil',
      city: '',
      coordinates: [-22.8918072, -43.2164655]
    },
    {
      id: '3f576b45-675d-4df7-96f0-2e35c6310780',
      name: 'Rio Port',
      capacity: 200,
      country: 'Brazil',
      city: 'Rio de Janeiro',
      coordinates: [-91, -180]
    }
  ]

  it.each(table)(
    'should not load port %s',
    ({ id, name, capacity, country, city, coordinates }) => {
      expect(() =>
        Port.of(
          id,
          name,
          capacity,
          country,
          city,
          coordinates as [number, number]
        )
      ).toThrow()
    }
  )

  it('should port has unique id on create', () => {
    const name = 'Rio Port'
    const capacity = 200
    const country = 'Brazil'
    const city = 'Rio de Janeiro'
    const coordinates: [number, number] = [-22.8918072, -43.2164655]

    const port1 = Port.create(name, capacity, country, city, coordinates)
    const port2 = Port.create(name, capacity, country, city, coordinates)

    expect(port1.id).not.toEqual(port2.id)
  })
})
