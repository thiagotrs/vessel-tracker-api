export default interface ICreateVessel {
  execute(
    name: string,
    ownership: string,
    year: number,
    portId: string
  ): Promise<void>
}
