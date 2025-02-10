import { ZodOpenApiPathsObject } from 'zod-openapi'

export const OPENAPI_METADATA_KEY = Symbol('openApiMetadata')

export type OpenApiMethodMetadata = {
  method: string
  path: string
  operation?: OpenApiOperation
  requestBody?: any
  responses: Record<number, any>
}

type OpenApiOperation = {
  operationId: string
  description: string
  tags: string[]
  summary: string
}

class BaseController {
  public static getOpenApiPaths(): ZodOpenApiPathsObject {
    const paths: ZodOpenApiPathsObject = {}

    for (const methodName of Object.getOwnPropertyNames(this.prototype)) {
      const metadata: OpenApiMethodMetadata | undefined =
        Reflect.getOwnMetadata(OPENAPI_METADATA_KEY, this.prototype, methodName)

      if (metadata) {
        if (!paths[metadata.path]) {
          paths[metadata.path] = {}
        }

        paths[metadata.path][metadata.method] = {
          ...metadata.operation,
          requestBody: metadata.requestBody,
          responses: metadata.responses,
        }
      }
    }

    console.log(paths)

    return paths
  }
}

export { BaseController }
