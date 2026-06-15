// src/common/utils/api-response.ts

export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public statusCode: number,
    public message: string,
    public data?: T,
  ) {}

  static success<T>(
    data: T,
    message = 'Success',
    statusCode = 200,
  ) {
    return new ApiResponse(
      true,
      statusCode,
      message,
      data,
    );
  }

  static error(
    message: string,
    statusCode = 400,
  ) {
    return new ApiResponse(
      false,
      statusCode,
      message,
    );
  }
}