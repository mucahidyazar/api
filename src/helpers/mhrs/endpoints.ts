export const ENDPOINTS = {
  login: () => 'https://prd.mhrs.gov.tr/api/vatandas/login',
  cities: () => 'https://prd.mhrs.gov.tr/api/yonetim/genel/il/selectinput-tree',
  // {value: 342, text: "İSTANBUL(ANADOLU)", children: [], value2: 1, value3: 34, text2: "", favori: false}
  districts: (cityId: number) =>
    `https://prd.mhrs.gov.tr/api/yonetim/genel/ilce/selectinput/${cityId}`,
  // Examples:
  // {value: "1835", text: "PENDİK"},
  // {value: "2015", text: "TUZLA"}
  // {value: "1449", text: "KARTAL"}
  policilinics: (cityId: number, districtId: number) =>
    `https://prd.mhrs.gov.tr/api/kurum/kurum/kurum-klinik/il/${cityId}/ilce/${districtId}/kurum/-1/aksiyon/200/select-input`,
  doctors: () =>
    'https://prd.mhrs.gov.tr/api/kurum-rss/randevu/slot-sorgulama/arama',
  hours: () =>
    'https://prd.mhrs.gov.tr/api/kurum-rss/randevu/slot-sorgulama/slot',
  appointment: () => 'https://prd.mhrs.gov.tr/api/kurum/randevu/randevu-ekle',
}
