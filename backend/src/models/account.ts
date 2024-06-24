import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/db';
import { PatreonToken } from './patreon.token';

export class Account extends Model {
  public id!: number;
  public name!: string;
  public status!: string;
  public last_login!: Date;
}

Account.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'disabled', 'deleted']], // list of allowed values
          msg: 'Status can only be active, disabled or deleted.'
        }
      }
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  },
  {
    sequelize,
    tableName: 'accounts'
  },
);

Account.hasOne(PatreonToken, {foreignKey: 'account_id', as: 'account'});

sequelize.sync()
  .then(() => console.log('Account model was synchronized successfully.'))
  .catch(error => console.error('Error synchronizing the Account model:', error));
