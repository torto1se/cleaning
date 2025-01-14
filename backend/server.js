const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001; // Порт для сервера

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение к базе данных SQLite
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Подключено к базе данных SQLite.');
});

// Создание таблицы пользователей, если она не существует
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    fullname TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`);

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, fullname, phone, email, password } = req.body;
    
    // Хеширование пароля
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Вставка нового пользователя в базу данных
        db.run(`INSERT INTO users (username, fullname, phone, email, password) VALUES (?, ?, ?, ?, ?)`, 
            [username, fullname, phone, email, hash], 
            function(err) {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.status(201).json({ message: 'Пользователь зарегистрирован', userId: this.lastID });
            }
        );
    });
});

// Авторизация пользователя
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Неверный логин или пароль' });
        }

        // Проверка пароля
        bcrypt.compare(password, user.password, (err, match) => {
            if (!match) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
            }

            // Генерация JWT токена
            const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
            res.json({ token });
        });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
