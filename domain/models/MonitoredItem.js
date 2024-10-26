import { DataTypes } from 'sequelize';
import {sequelize} from '../../database.js';

export const MonitoredItem = sequelize.define('MonitoredItem', {
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  item_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

