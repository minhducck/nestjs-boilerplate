export type SuccessResponse<T = any> = {
  error: false;
  data: T;
  message?: string;
};

// export type FailureResponse = {
//   code: number;
//   error: true;
//   message: string;
//   stackTrace?: string;
// };

export class FailureResponse extends Error {
  name: string;
  error: true;
  message: string;
  stack?: string;
}

export type APIResponse<T> = SuccessResponse<T> | FailureResponse;
