export default interface User {
  _id: string
  userId: string
  baseUri: string
  measurementInterval: number
  reportInterval: number
  refMillivolts: number
  weMillivolts: number
  filterLength: number
  checkParametersInterval: number
  blinded: boolean
  sensorId?: string
  comment?: string
}
