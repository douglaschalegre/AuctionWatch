import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.db', // Arquivo SQLite onde os dados serão salvos
  logging: false,           // Desativa o log de SQL no console
});