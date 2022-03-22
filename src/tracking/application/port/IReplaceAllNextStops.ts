export default interface IReplaceAllNextStops {
  execute(vesselId: string, nextPortIds: string[]): Promise<void>
}
