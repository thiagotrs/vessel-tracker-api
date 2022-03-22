export default interface IDockVessel {
  execute(vesselId: string): Promise<void>
}
