import { Request, Response } from 'express';

import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';

import { BadLuck } from '../models/luck/bad.luck';
import { BlobLuck } from '../models/luck/blob.luck';
import { BaseController } from './base.controller';

export default class StorageController extends BaseController {
  private client: S3Client;

  constructor() {
    super();

    this.client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.STORAGE_ID || '',
        secretAccessKey: process.env.STORAGE_KEY || ''
      }
    });
  }

  public async get_model(request: Request, response: Response) {
    const model_name = request.params['model_name'];

    const command = new GetObjectCommand({
      Bucket: 'oizu-models',
      Key: `${model_name}.gltf`,
    });

    this.client.send(command).then((body: GetObjectCommandOutput) => {
      body.Body?.transformToString().then((array: string) => {
        const data = array; // @TODO: Add obfuscation;

        response.setHeader('Content-Type', 'model/gltf+json');
        response.setHeader('Content-Length', data.length);

        BlobLuck.send(response, data);
      }).catch(error => {
        BadLuck.send(error, request, response, 'Error converting a model.');
      });
    }).catch((error) => {
      BadLuck.send(error, request, response, 'Error fetching a model from storage.');
    });
  }
}
