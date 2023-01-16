const DISTRIBUTION = {
  random: 'random',
  equal: 'equal',
} as const

type TDistribution = keyof typeof DISTRIBUTION

interface IGenerateCommits {
  from: string | Date
  to: string | Date
  distribution?: TDistribution
  count: number
  options?: {
    excludeWeekends?: boolean
  }
}

interface ICommit {
  date: string
  message: string
}

interface IGetNewDate {
  date?: string
  excludeWeekends?: boolean
}

export {DISTRIBUTION, TDistribution, IGenerateCommits, ICommit, IGetNewDate}
