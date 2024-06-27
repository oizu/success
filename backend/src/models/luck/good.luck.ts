import { Luck } from './luck';
import { Request, Response } from 'express';

export class GoodLuck extends Luck {
  public data!: any;

  constructor(data: any) {
    super('success');
    this.data = data;
  }

  static send(response: Response, data: any) {
    response.status(200).send(new GoodLuck(data));
  }
}
