import { Sequelize } from 'sequelize';

// Carga .env como fallback local (opcional, solo para desarrollo)
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mysql',
  logging: console.log, // Habilita logs para depuración (puedes cambiar a false en producción)
  dialectOptions: {
    connectTimeout: 30000 // Aumenta el tiempo de espera a 30 segundos
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Verificación de conexión (opcional pero útil)
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
})();

export default sequelize;