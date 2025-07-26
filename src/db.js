import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

// Usa MYSQL_URL (interna) o MYSQL_URL_PUBLIC (pública) si DATABASE_URL no está disponible
const dbUrl = process.env.MYSQL_URL || process.env.MYSQL_URL_PUBLIC || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('No se encontró ninguna URL de base de datos (MYSQL_URL, MYSQL_URL_PUBLIC o DATABASE_URL)');
}

const sequelize = new Sequelize(dbUrl, {
  dialect: 'mysql',
  logging: console.log, // Habilita logs para depuración
  dialectOptions: {
    connectTimeout: 30000 // Aumenta el tiempo de espera
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Verificación de conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
})();

export default sequelize;