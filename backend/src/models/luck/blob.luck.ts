import { Response } from 'express';

export class BlobLuck {

  public static send(response: Response, data: any) {
    response.status(200).send(data);
  }
}
