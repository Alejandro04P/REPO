const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos y parsear JSON
app.use(cors());
 // Habilitar CORS
app.use(express.static('public'));  // Servir archivos estáticos
app.use(bodyParser.json());  // Parsear JSON en el cuerpo de la solicitud
app.listen(3000, '172.16.0.133', () => {
    console.log('Servidor escuchando en http://172.16.0.133:3000');
  });

// Inicializar la base de datos SQLite
const db = new sqlite3.Database('./usuarios.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            nombre TEXT NOT NULL,
            apellido TEXT NOT NULL,
            fecha_nacimiento DATE NOT NULL,
            telefono TEXT NOT NULL,
            direccion TEXT NOT NULL,
            genero TEXT NOT NULL,
            ocupacion TEXT NOT NULL
        )`);
    }
});

// Ruta POST para registrar un nuevo usuario
app.post('/registro', (req, res) => {
    const {username, password, email, nombre, apellido, fecha_nacimiento, telefono, direccion, genero, ocupacion} = req.body;
    console.log('Datos recibidos:', { username, password, email, nombre, apellido, fecha_nacimiento, telefono, direccion, genero, ocupacion });

    // Primero, verificar si el nombre de usuario o correo ya existen en la base de datos
    const checkUserSql = 'SELECT * FROM usuarios WHERE username = ? OR email = ?';
    db.get(checkUserSql, [username, email], (err, row) => {
        if (err) {
            return res.status(500).send({ success: false, message: 'Error al verificar datos' });
        }

        // Si se encuentra un usuario con el mismo nombre o correo, devolver un error
        if (row) {
            return res.status(400).send({ success: false, message: 'El nombre de usuario o el correo ya están registrados' });
        }

        // Si no existe un usuario con ese nombre o correo, continuar con el registro
        const sql = 'INSERT INTO usuarios (username, password, email, nombre, apellido, fecha_nacimiento, telefono, direccion, genero, ocupacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.run(sql, [username, password, email, nombre, apellido, fecha_nacimiento, telefono, direccion, genero, ocupacion], function (err) {
            if (err) {
                console.error('Error al insertar el usuario:', err.message);
                return res.status(500).send({ success: false, message: 'Error al registrar el usuario', error: err.message });
            }
            console.log('Usuario registrado exitosamente');
            res.status(201).send({ success: true, message: 'Usuario registrado exitosamente' });
        });       
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Verificar si el usuario existe
    const checkUserSql = 'SELECT * FROM usuarios WHERE username = ?';
    db.get(checkUserSql, [username], (err, row) => {
        if (err) {
            return res.status(500).send({ message: 'Error al verificar datos' });
        }
        if (!row) {
            return res.status(400).send({ message: 'El usuario no existe' });
        }
        // Verificar si la contraseña es correcta
        if (row.password !== password) {
            return res.status(400).send({ message: 'Contraseña incorrecta' });
        }
        res.status(200).send({ message: 'Inicio de sesión exitoso', success: true });
    });
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/pagina1.html');
});
// Inicializar el servidor

