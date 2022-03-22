export default interface ICreatePort {
  execute(
    name: string,
    capacity: number,
    country: string,
    city: string,
    coordinates: [number, number]
  ): Promise<void>
}
