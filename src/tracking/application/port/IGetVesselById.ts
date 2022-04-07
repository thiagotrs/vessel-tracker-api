import Vessel from '../../domain/Vessel'

export default interface IGetVesselById {
  execute(id: string): Promise<Vessel>
}
