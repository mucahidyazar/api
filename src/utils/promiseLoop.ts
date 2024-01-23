// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function promiseLoop<T = any>(arr: T[], fn: (item: T) => Promise<any>) {
  return arr.reduce((promise, item) => {
    return promise.then(() => fn(item))
  }, Promise.resolve())
}
