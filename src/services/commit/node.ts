import jsonfile from 'jsonfile'
import { simpleGit } from 'simple-git'
import moment from 'moment'
import { faker } from '@faker-js/faker'
import path from 'path'
import fs from 'fs'

import { promiseLoop } from '@/utils'

import { DISTRIBUTION, IGetNewDate, IGenerateCommits, ICommit } from './types'

const time = moment()
const secretPath = path.resolve(__dirname, '../../secret')
const getProjectPath = (projectName: 'commit') => {
  return path.resolve(secretPath, projectName)
}
const projectPath = getProjectPath('commit')
const dataPath = path.resolve(projectPath, 'data.json')
// const aDayAgo = moment().subtract(1, 'day').format()
// const aMonthAgo = moment().subtract(1, 'month').format()
// const aYearAgo = moment().subtract(1, 'year').format()

const isWeekend = (date: string) => {
  const day = moment(date).day()
  return day === 0 || day === 6
}

const getNewDate = ({ date, excludeWeekends }: IGetNewDate) => {
  const defaultDate = moment(date).add(1, 'days').format()
  let theDate = date || defaultDate

  if (excludeWeekends) {
    while (isWeekend(theDate)) {
      theDate = moment(theDate).add(1, 'days').format()
    }
  }
  return theDate
}

export function generateCommits({
  from = time.subtract(1, 'year').format(),
  to = time.format(),
  distribution = DISTRIBUTION.equal,
  count,
  options = { excludeWeekends: false },
}: IGenerateCommits): ICommit[] {
  const { excludeWeekends } = options

  const commits: ICommit[] = []
  const fromTime = moment(from)
  const toTime = moment(to)
  const diff = toTime.diff(fromTime, 'days')

  if (distribution === DISTRIBUTION.equal) {
    const commitsPerDay = Math.ceil(count / diff)
    let date = fromTime.add(1, 'days').format()

    if (count < diff) {
      for (let i = 0; i < count; i++) {
        date = getNewDate({ excludeWeekends })
        const message = 'commit: ' + faker.git.commitMessage()
        commits.push({ date, message })
      }
      return commits
    }

    for (let i = 0; i < count; i++) {
      if (i % commitsPerDay === 0) {
        date = getNewDate({ excludeWeekends })
      }
      const message = 'commit: ' + faker.git.commitMessage()
      commits.push({ date, message })
    }
    return commits
  }

  if (distribution === DISTRIBUTION.random) {
    for (let i = 0; i < count; i++) {
      let date = getNewDate({
        date: moment(faker.date.between(from, to)).format(),
        excludeWeekends,
      })

      const message = 'commit: ' + faker.git.commitMessage()
      commits.push({ date, message })
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
    options: { excludeWeekends: true },
  })

  const git = simpleGit()
  git.cwd(path.resolve(__dirname, './secret'))
  if (await fs.existsSync(projectPath)) {
    await fs.rmSync(projectPath, { recursive: true })
  }
  await git.clone('https://github.com/mucahidyazar/commit.git')
  git.cwd(projectPath)
  git.addConfig('user.name', 'Mucahid Yazar')
  git.addConfig('user.email', 'mucahidyazar@gmail.com')

  const jsonCommits = await jsonfile.readFile(dataPath)
  await promiseLoop<ICommit>(commits, async commit => {
    jsonCommits.push(commit)
    await jsonfile.writeFileSync(dataPath, jsonCommits, { spaces: 2 })
    await git.add([dataPath])
    await git.commit(commit.message, { '--date': commit.date })
  })
  // await git.log().then(log => logger(log))
  git.push('origin', 'main')
  // git.push('origin', 'main', ['-f'])
}

makeCommit()
