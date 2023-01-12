export interface IStartAppArgs {
  cityId?: number | string
  districtId?: number | string
  policinicId?: number | string
}

export interface IGetDoctors {
  cityId: number | string
  districtId: number | string
  policinicId: number | string
}

export interface IGetHours {
  doctorId: number | string
  cityId: number | string
  policinicId: number | string
}
