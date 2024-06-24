import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/db';
import { Account } from './account';

export class PatreonToken extends Model {
  public email!: string;
  public access_token!: string;
  public refresh_token!: string;
  public expires_in!: string;
  public scope!: string;
  public token_type!: string;
  public account!: Account;
}

PatreonToken.init(
  {
    email: {
      type: DataTypes.STRING(64),
      primaryKey: true
    },
    access_token: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    refresh_token: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    expires_in: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token_type: {
      type: DataTypes.STRING(8),
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'patreon_tokens'
  },
);
