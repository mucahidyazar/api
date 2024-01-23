export interface IAppointment {
  value: number
  text: string
  children: IAppointment[]
  value2: number
  value3: number
  text2: string
  favori: boolean
}

export interface ICheckStock {
  link: string
  brandName: TBrandName
}
export interface ICheckStockResult {
  link: string
  brand: TBrand
  price?: string
  hasProduct: boolean
  productName?: string
  productImage?: string
}

export interface ICheckStockRetry {
  link: string
  brandName: TBrandName
  retry?: number
  delay?: number
  condition?: {
    maxPrice?: number
    minPrice?: number
    hasFound?: boolean
  }
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

export interface IGetDoctors {
  cityId: number | string
  districtId: number | string
  polyclinicId: number | string
}

export interface IGetHours {
  doctorId: number | string
  cityId: number | string
  polyclinicId: number | string
}

export interface IStartAppArgs {
  cityId?: number | string
  districtId?: number | string
  polyclinicId?: number | string
}

export interface IXPathItem {
  path: string
  condition: (text: string) => boolean
}

export type TBrand = {
  name: TBrandName
  xPath: {
    priceElement: string | IXPathItem
    addCartButton: string | IXPathItem
    sellerElement?: IXPathItem
    productName?: string
    productImage?: string
  }
}

export type TBrandName = 'amazon' | 'mediamarkt'
