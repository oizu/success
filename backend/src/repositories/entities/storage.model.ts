import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../db/db';

export class StorageModel extends Model {
  public name!: string;
  public version!: string;
  public latest!: boolean;
  public key!: string;
  public bucket!: string;
}

StorageModel.init(
  {
    name: {
      type: DataTypes.STRING(128),
      primaryKey: true,
    },
    version: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: 'v0',
      primaryKey: true,
    },
    latest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    key: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    bucket: {
      type: DataTypes.STRING(256),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'storage_models'
  },
);

sequelize.sync()
  .then(() => console.log('StorageModel model was synchronized successfully.'))
  .catch(error => console.error('Error synchronizing the StorageModel model:', error));
