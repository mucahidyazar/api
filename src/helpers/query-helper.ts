import { Query } from 'mongoose'

type TGetPaginationMetadataArgs = {
  limit: number
  page: number
  totalItems: number
}
export function getPaginationMetadata({
  limit,
  page,
  totalItems,
}: TGetPaginationMetadataArgs) {
  const totalPages = Math.ceil(totalItems / limit)

  return {
    page,
    limit,
    totalItems,
    totalPages,
    currentPage: page,
    hasNextPage: totalItems > page * limit,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  }
}

type ListRequestQuery = {
  page?: string
  limit?: string
  populateFields?: string
}

type TQueryHelperArgs = {
  queries: ListRequestQuery & { totalItems?: number }
  query: Query<any, any>
}
export function queryHelper({ queries, query }: TQueryHelperArgs) {
  const populateFields = queries.populateFields
    ? queries.populateFields.split(',')
    : []
  populateFields.forEach(field => {
    query.populate(field)
  })

  let metadata
  if (queries.totalItems) {
    const page = parseInt(queries.page || '1')
    const limit = parseInt(queries.limit || '50')
    const skip = (page - 1) * limit

    query.skip(skip).limit(limit)

    metadata = getPaginationMetadata({
      limit,
      page,
      totalItems: queries.totalItems,
    })
  }

  return {
    metadata,
  }
}
