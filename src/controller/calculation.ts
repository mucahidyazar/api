import { Request, Response } from 'express'

import { Calculation } from '@/model/calculation'
import { ApiError } from '@/errors/api-error'
import { ApiResponse } from '@/utils'
import { ERROR_CODE } from '@/constants'

/**
 * @route POST api/v1/calculations
 * @description Create a new calculation
 * @access Private
 * @param {TCalculationDto} req.body
 * @returns {ApiResponse<TCalculationDto>} 201 - Success response with created calculation
 */
async function calculationCreate(req: Request, res: Response) {
  const newCalculation = new Calculation({
    ...req.body,
    user: req.user._id,
  })

  const data = await newCalculation.save()

  return res.response({
    statusCode: 201,
    apiResponse: ApiResponse.success(data),
  })
}

async function calculationList(req: Request, res: Response) {
  const { populateFields: _populateFields, ...queries } = req.query

  const data = await Calculation.find({
    user: req.user._id,
    ...queries,
  })

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function calculationGet(req: Request, res: Response) {
  const data = await Calculation.findById(req.params.id)
  if (!data) {
    throw new ApiError('Calculation not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function calculationUpdate(req: Request, res: Response) {
  const data = await Calculation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  })
  if (!data) {
    throw new ApiError('Calculation not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(data),
  })
}

async function calculationDelete(req: Request, res: Response) {
  const data = await Calculation.findByIdAndDelete(req.params.id)
  if (!data) {
    throw new ApiError('Calculation not found', ERROR_CODE.EntityNotFound)
  }

  return res.response({
    statusCode: 200,
    apiResponse: ApiResponse.success(null),
  })
}

export {
  calculationCreate,
  calculationDelete,
  calculationGet,
  calculationList,
  calculationUpdate,
}
