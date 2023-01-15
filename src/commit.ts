import jsonfile from 'jsonfile'
import {simpleGit} from 'simple-git'
import moment from 'moment'
import {faker} from '@faker-js/faker'
import path from 'path'
import fs from 'fs'

const time = moment()
const filePath = path.resolve(__dirname, './secret/commit/data.json')
// const aDayAgo = moment().subtract(1, 'day').format()
// const aMonthAgo = moment().subtract(1, 'month').format()
// const aYearAgo = moment().subtract(1, 'year').format()

const DISTRIBUTION = {
  random: 'random',
  equal: 'equal',
} as const
type TDistribution = keyof typeof DISTRIBUTION

const isWeekend = (date: string) => {
  const day = moment(date).day()
  return day === 0 || day === 6
}

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
export function generateCommits({
  from = time.subtract(1, 'year').format(),
  to = time.format(),
  distribution = DISTRIBUTION.equal,
  count,
  options = {excludeWeekends: false},
}: IGenerateCommits): ICommit[] {
  const {excludeWeekends} = options

  const commits: ICommit[] = []
  const fromTime = moment(from)
  const toTime = moment(to)
  const diff = toTime.diff(fromTime, 'days')

  if (distribution === DISTRIBUTION.equal) {
    const commitsPerDay = Math.ceil(count / diff)
    let date = fromTime.add(1, 'days').format()

    if (count < diff) {
      for (let i = 0; i < count; i++) {
        date = fromTime.add(1, 'days').format()
        if (excludeWeekends) {
          while (isWeekend(date)) {
            date = fromTime.add(1, 'days').format()
          }
        }
        const message = 'commit: ' + faker.git.commitMessage()
        commits.push({date, message})
      }
      return commits
    }

    for (let i = 0; i < count; i++) {
      if (i % commitsPerDay === 0) {
        date = fromTime.add(1, 'days').format()
        if (excludeWeekends) {
          while (isWeekend(date)) {
            date = fromTime.add(1, 'days').format()
          }
        }
      }
      const message = 'commit: ' + faker.git.commitMessage()
      commits.push({date, message})
    }
    return commits
  }

  if (distribution === DISTRIBUTION.random) {
    for (let i = 0; i < count; i++) {
      let date = moment(faker.date.between(from, to)).format()
      if (excludeWeekends) {
        while (isWeekend(date)) {
          date = fromTime.add(1, 'days').format()
        }
      }
      const message = 'commit: ' + faker.git.commitMessage()
      commits.push({date, message})
    }
    return commits
  }

  return []
}

async function makeCommit() {
  const commits = generateCommits({
    from: '2017-01-01T10:00:00+12:00',
    to: '2018-12-31T10:00:00+12:00',
    count: 1000,
    distribution: DISTRIBUTION.random,
    options: {
      excludeWeekends: true,
    },
  })

  const git = simpleGit()
  // I created a secret folder in src
  // go secret folder and init git
  git.cwd(path.resolve(__dirname, './secret'))
  // check if the file exists
  const repoName = 'commit'
  const repoPath = path.resolve(__dirname, `./secret/${repoName}`)
  if (await fs.existsSync(repoPath)) {
    // delete commit folder if it exist
    await fs.rmSync(path.resolve(__dirname, './secret/commit'), {
      recursive: true,
    })
  }
  await git.clone('https://github.com/mucahidyazar/commit.git')
  git.cwd(repoPath)
  git.addConfig('user.name', 'Mucahid Yazar')
  git.addConfig('user.email', 'mucahidyazar@gmail.com')

  const jsonCommits = await jsonfile.readFile(filePath)
  await promiseLoop<ICommit>(commits, async commit => {
    jsonCommits.push(commit)
    await jsonfile.writeFileSync(filePath, jsonCommits, {
      spaces: 2,
    })
    await git.add([filePath])
    await git.commit(commit.message, {'--date': commit.date})
  })
  // await git.log().then(log => console.log(log?.total))
  git.push('origin', 'main')
  // git.push('origin', 'main', ['-f'])
}

makeCommit()

function promiseLoop<T = any>(arr: T[], fn: (item: T) => Promise<any>) {
  return arr.reduce((promise, item) => {
    return promise.then(() => fn(item))
  }, Promise.resolve())
}
