import Vessel from '@/tracking/domain/Vessel'

export default interface IGetVesselById {
  execute(id: string): Promise<Vessel>
}
