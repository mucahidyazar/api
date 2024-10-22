
export const pastelColors = {
  '#F57D30': '#F57D30',
  '#F68A43': '#F68A43',
  '#4A5060': '#4A5060',
  '#5B6075': '#5B6075',
  '#EDD2C2': '#EDD2C2',
  '#F6E5D6': '#F6E5D6',
  '#5599D1': '#5599D1',
  '#66A3DA': '#66A3DA',
  '#D8A5D4': '#D8A5D4',
  '#D7B1D2': '#D7B1D2',
  '#F9C977': '#F9C977',
  '#FED591': '#FED591',
  '#6BC7BF': '#6BC7BF',
  '#8ED1CC': '#8ED1CC',
  '#9CA9EE': '#9CA9EE',
}

export function getRandomPastelColor() {
  const keys = Object.keys(pastelColors) as (keyof typeof pastelColors)[];
  return pastelColors[keys[(keys.length * Math.random()) << 0]];
}