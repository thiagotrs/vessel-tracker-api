export default interface IUndockVessel {
  execute(vesselId: string): Promise<void>
}
