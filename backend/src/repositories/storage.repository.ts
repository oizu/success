import { StorageModel } from './entities/storage.model';

export class StorageRepository {
  constructor() {
  }

  public async get_model(name: string, version: string): Promise<StorageModel | null> {
    if ('latest' == version) {
      return StorageModel.findOne({
        where: {
          name: name,
          latest: true
        }
      });
    }

    return StorageModel.findOne({
      where: {
        name: name,
        version: version
      }
    });
  }
}
