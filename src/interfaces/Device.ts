export default interface Device {
  _id: string
  deviceName: string
  macAddress: string
  password: string
  baseUri: string
  jwtToken: string
  jwtRefreshToken: string
  rtc: string
  sessionStartTime: string
  sessionEndTime: string
  measurementInterval: number
  transmitDelay: number
  checkParametersInterval: number
  pstatVoltage: number
  pstatTIA: number
  glm: number
  coat: string
  onTest: string
  enzyme: number
  testStation: number
}
