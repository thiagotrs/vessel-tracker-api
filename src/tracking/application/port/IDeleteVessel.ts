export default interface IDeleteVessel {
  execute(id: string): Promise<void>
}
