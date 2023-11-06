import { AxiosInstance } from 'axios';
import { Logger } from '@nestjs/common';

export function addLogHandler(client: AxiosInstance, logger: Logger) {
  client.interceptors.request.use(
    (value) => {
      logger.log(
        `Req: `,
        JSON.stringify({
          url: value.url,
          data: JSON.stringify(value.data),
        }),
      );
      return value;
    },
    (error) => {
      logger.error(`Err:`, error.message, error);
      throw error;
    },
  );
  client.interceptors.response.use(
    (response) => {
      logger.log(
        `Req/Res: `,
        JSON.stringify({
          apiURL: response.request.url,
          apiData: JSON.stringify(response.request.data),
          apiResponse: JSON.stringify(response.data),
        }),
      );
      return response;
    },
    (error) => {
      logger.error(`Err:`, error.message, error);
      throw error;
    },
  );
}
