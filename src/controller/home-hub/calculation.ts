import { Request, Response } from 'express';

import { Calculation } from '../../model/home-hub/calculation';

async function calculationCreate(req: Request, res: Response) {
  try {
    const calculation = new Calculation({
      ...req.body,
      user: req.user._id,
    });

    await calculation.save();
    return res.response({
      status: 'success',
      code: 201,
      message: 'Calculation created successfully',
      data: calculation,
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function calculationList(req: Request, res: Response) {
  try {
    const { populateFields: _populateFields, ...queries } = req.query
    const calculations = await Calculation.find({
      user: req.user._id,
      ...queries,
    });

    return res.response({
      status: 'success',
      code: 200,
      message: 'Calculation list fetched successfully',
      data: calculations,
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function calculationGet(req: Request, res: Response) {
  try {
    const calculation = await Calculation.findById(req.params.id);
    if (!calculation) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Calculation not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Calculation fetched successfully',
      data: calculation,
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function calculationUpdate(req: Request, res: Response) {
  try {
    const calculation = await Calculation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!calculation) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Calculation not found',
      });
    }

    return res.response({
      status: 'success',
      code: 200,
      message: 'Calculation updated successfully',
      data: calculation
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

async function calculationDelete(req: Request, res: Response) {
  try {
    const response = await Calculation.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.response({
        status: 'error',
        code: 404,
        message: 'Calculation not found',
      });
    }
    return res.response({
      status: 'success',
      code: 200,
      message: 'Calculation deleted successfully',
      data: response,
    });
  } catch (error: any) {
    return res.response({
      status: 'error',
      code: 500,
      message: error.message,
      details: error,
    });
  }
}

export { calculationCreate, calculationDelete, calculationGet, calculationList, calculationUpdate };
