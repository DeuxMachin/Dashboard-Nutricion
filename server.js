import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'dashboard_nutricion',
  charset: 'utf8mb4'
};

// Funcion para crear conexión a la base de datos
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a la base de datos MySQL');
    return connection;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    throw error;
  }
}

// Middleware de autenticacion
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Ruta de login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const connection = await createConnection();
    
    // Buscamos al nutricionista por Rut o Correo
    const [nutritionistResults] = await connection.execute(
      `SELECT n.*, l.Contrasena_hash, l.Rol 
       FROM nutricionista n 
       INNER JOIN login l ON n.ID_Nutri = l.ID_Nutri 
       WHERE n.Rut = ? OR n.Correo = ?`,
      [username, username]
    );

    await connection.end();

    if (nutritionistResults.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = nutritionistResults[0];
    
    // Verificamos contraseña
    const isValidPassword = password === user.Contrasena_hash;
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.ID_Nutri, 
        username: user.Rut,
        email: user.Correo,
        role: user.Rol,
        nombre: user.Nombre,
        apellido: user.Apellido
      },
      process.env.JWT_SECRET || 'tu_clave_secreta_aqui',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.ID_Nutri,
        username: user.Rut,
        email: user.Correo,
        nombre: user.Nombre,
        apellido: user.Apellido,
        role: user.Rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener información del usuario autenticado
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [results] = await connection.execute(
      'SELECT ID_Nutri, Nombre, Apellido, Rut, Correo FROM nutricionista WHERE ID_Nutri = ?',
      [req.user.id]
    );

    await connection.end();

    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener clientes del nutricionista
app.get('/api/clientes', authenticateToken, async (req, res) => {
  try {
    const connection = await createConnection();
    
    const [results] = await connection.execute(
      'SELECT * FROM cliente WHERE ID_Nutri = ? AND Inactividad = 0',
      [req.user.id]
    );

    await connection.end();
    res.json(results);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de prueba de conexión
app.get('/api/test', async (req, res) => {
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    res.json({ message: 'Conexión a la base de datos exitosa' });
  } catch (error) {
    res.status(500).json({ error: 'Error de conexión a la base de datos' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(` Dashboard disponible en http://localhost:5173`);
});

export default app;
