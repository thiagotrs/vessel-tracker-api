export default interface IDeletePort {
  execute(id: string): Promise<void>
}
