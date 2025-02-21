import { z } from 'zod'

import { OPENAPI_METADATA_KEY } from '@/constants'
import {
  BaseController,
  OpenApiMethodMetadata,
} from '@/controller/base.controller'

function createMethodDecorator(method: string) {
  return function (path: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor,
    ) {
      const existingMetadata: OpenApiMethodMetadata = Reflect.getMetadata(
        OPENAPI_METADATA_KEY,
        target,
        propertyKey,
      ) || {
        method: '',
        path: '',
        responses: {},
        requestBody: undefined,
        operation: undefined,
      }

      const mergedMetadata: OpenApiMethodMetadata = {
        ...existingMetadata,
        method,
        path,
      }

      Reflect.defineMetadata(
        OPENAPI_METADATA_KEY,
        mergedMetadata,
        target,
        propertyKey,
      )
      return descriptor
    }
  }
}

const Get = createMethodDecorator('get')
const Post = createMethodDecorator('post')
const Put = createMethodDecorator('put')
const Patch = createMethodDecorator('patch')
const Delete = createMethodDecorator('delete')

function ApiOperation(config: {
  operationId: string
  description: string
  tags: string[]
  summary: string
  security: {
    bearerAuth: string[]
  }
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const existingMetadata: OpenApiMethodMetadata = Reflect.getMetadata(
      OPENAPI_METADATA_KEY,
      target,
      propertyKey,
    ) || {
      method: '',
      path: '',
      responses: {},
      requestBody: undefined,
      operation: undefined,
      security: [],
    }

    existingMetadata.operation = config
    Reflect.defineMetadata(
      OPENAPI_METADATA_KEY,
      existingMetadata,
      target,
      propertyKey,
    )
    return descriptor
  }
}

function ApiBody(required: boolean, schema: z.ZodSchema) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const existingMetadata: OpenApiMethodMetadata = Reflect.getMetadata(
      OPENAPI_METADATA_KEY,
      target,
      propertyKey,
    ) || {
      method: '',
      path: '',
      responses: {},
      requestBody: undefined,
      operation: undefined,
    }

    existingMetadata.requestBody = {
      required,
      content: { 'application/json': { schema } },
    }

    Reflect.defineMetadata(
      OPENAPI_METADATA_KEY,
      existingMetadata,
      target,
      propertyKey,
    )
    return descriptor
  }
}

function DApiResponse(
  statusCode: number,
  description: string,
  schema: z.ZodSchema,
) {
  return function (
    target: BaseController,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const metadata: OpenApiMethodMetadata = Reflect.getMetadata(
      OPENAPI_METADATA_KEY,
      target,
      propertyKey,
    ) || {
      method: '',
      path: '',
      responses: {},
      requestBody: undefined,
      operation: undefined,
    }

    metadata.responses[statusCode] = {
      description,
      content: {
        'application/json': { schema },
      },
    }

    Reflect.defineMetadata(OPENAPI_METADATA_KEY, metadata, target, propertyKey)
    return descriptor
  }
}

export { ApiBody, ApiOperation, DApiResponse, Delete, Get, Patch, Post, Put }
