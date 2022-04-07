import Vessel from '../../domain/Vessel'

export default interface IGetAllVessls {
  execute(): Promise<Vessel[]>
}
