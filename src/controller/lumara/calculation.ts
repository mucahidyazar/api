import { Request, Response } from 'express';

import { Calculation } from '@/model/lumara/calculation';
import { ApiError } from '@/services/api-error';

async function calculationCreate(req: Request, res: Response) {
  const newCalculation = new Calculation({
    ...req.body,
    user: req.user._id,
  });

  const data = await newCalculation.save();

  return res.response({
    status: 'success',
    code: 201,
    message: 'Calculation created successfully',
    data,
  });
}

async function calculationList(req: Request, res: Response) {
  const { populateFields: _populateFields, ...queries } = req.query

  const data = await Calculation.find({
    user: req.user._id,
    ...queries,
  });

  return res.response({
    status: 'success',
    code: 200,
    message: 'Calculation list fetched successfully',
    data,
  });
}

async function calculationGet(req: Request, res: Response) {
  const data = await Calculation.findById(req.params.id);
  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Calculation not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Calculation fetched successfully',
    data,
  });
}

async function calculationUpdate(req: Request, res: Response) {
  const data = await Calculation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Calculation not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Calculation updated successfully',
    data
  });
}

async function calculationDelete(req: Request, res: Response) {
  const data = await Calculation.findByIdAndDelete(req.params.id);
  if (!data) {
    throw new ApiError(
      'ResourceNotFound',
      'Calculation not found',
    );
  }

  return res.response({
    status: 'success',
    code: 200,
    message: 'Calculation deleted successfully',
    data,
  });
}

export { calculationCreate, calculationDelete, calculationGet, calculationList, calculationUpdate };
