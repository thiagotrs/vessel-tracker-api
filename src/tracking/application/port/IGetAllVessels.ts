import Vessel from '@/tracking/domain/Vessel'

export default interface IGetAllVessls {
  execute(): Promise<Vessel[]>
}
