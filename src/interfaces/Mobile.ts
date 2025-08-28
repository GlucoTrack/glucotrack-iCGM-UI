export default interface Mobile {
  _id: string
  mobileName: string
  baseUri: string
  sensorId: string
  sensorName: string
  measurementInterval: number
  reportInterval: number
  refMillivolts: number
  weMillivolts: number
  filterLength: number
  checkParametersInterval: number
  comment?: string
  lastSeen?: string | null
  remoteCommand?: string | null
  remoteCommandReply?: string | null
}
