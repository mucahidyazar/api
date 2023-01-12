import {TBrand} from '../constants'

export interface IXPathItem {
  path: string
  condition: (text: string) => boolean
}

export interface IBrand {
  name: string
  xPath: {
    priceElement: string | IXPathItem
    addCartButton: string | IXPathItem
    sellerElement?: IXPathItem
  }
}

export interface ICheckStockRetry {
  link: string
  brandName: TBrand
  retry?: number
  delay?: number
  condition?: {
    maxPrice?: number
    minPrice?: number
    hasFound?: boolean
  }
}

export interface ICheckStockResult {
  link: string
  brand: IBrand
  price?: string
  hasProduct: boolean
}

export interface ICheckStock {
  link: string
  brandName: TBrand
}

//! MHRS
export interface ICity {
  value: number
  text: string
  children: ICity[]
  value2: number
  value3: number
  text2: string
  favori: boolean
}

export interface IDistrict {
  value: number
  text: string
}

export interface IAppointment {
  value: number
  text: string
  children: IAppointment[]
  value2: number
  value3: number
  text2: string
  favori: boolean
}

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
