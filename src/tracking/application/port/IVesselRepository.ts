import Vessel from '@/tracking/domain/Vessel'

export default interface IVesselRepository {
  findAll(): Promise<Vessel[]>

  find(id: string): Promise<Vessel | null>

  delete(port: Vessel): Promise<void>

  save(port: Vessel): Promise<void>
}
