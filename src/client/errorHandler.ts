import { BaseError } from '../model/general/error'

import { logger } from './logger'

class ErrorHandler {
  public async handleError(err: Error): Promise<void> {
    await logger.error(
      'Error message from the centralized error-handling component',
      err,
    )
    // await sendMailToAdminIfCritical();
    // await sendEventsToSentry();
  }

  public isTrustedError(error: Error) {
    if (error instanceof BaseError) {
      return error.isOperational
    }
    return false
  }
}
export const errorHandler = new ErrorHandler()
