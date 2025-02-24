// we will write a type for the request parameters for pagination request

import 'zod-openapi/extend'
import { z } from 'zod'

const PaginationRequestParameters = z
  .object({
    page: z.number().min(1).default(1).openapi({
      description: 'The page number',
      example: 1,
      default: 1,
    }),
    limit: z.number().min(1).default(12).openapi({
      description: 'The number of items per page',
      example: 12,
      default: 12,
    }),
  })
  .openapi({
    description: 'The pagination request parameters',
    title: 'Pagination',
  })

type TPaginationRequestParameters = z.infer<typeof PaginationRequestParameters>

export { PaginationRequestParameters, TPaginationRequestParameters }
