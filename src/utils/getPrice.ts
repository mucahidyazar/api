interface IGetPrice {
  price: number | string
  currency?: string
  locale?: string
}
export function getPrice({
  price,
  currency = 'TRY',
  locale = 'tr-TR',
}: IGetPrice) {
  const sanitizedPrice = price
    .toString()
    .replace(/[^0-9,]/g, '')
    .split(',')[0]

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(Number(sanitizedPrice))
}
