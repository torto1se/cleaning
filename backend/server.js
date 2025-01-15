const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001; 

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Подключение к базе данных
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Подключено к базе данных SQLite.');
});

// Создание таблиц, если они не существуют
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    fullname TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    service TEXT NOT NULL,
    address TEXT NOT NULL,
    contact TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    paymentMethod TEXT NOT NULL,
    status TEXT,
    cancellationReason TEXT,
    fullname TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
)`);

// Регистрация пользователя
app.post('/register', (req, res) => {
    const { username, fullname, phone, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

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

        bcrypt.compare(password, user.password, (err, match) => {
            if (!match) {
                return res.status(401).json({ message: 'Неверный логин или пароль' });
            }

            const token = jwt.sign({ userId: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
            res.json({ token });
        });
    });
});


// Создание заказа
app.post('/orders', (req, res) => {
    const { service, address, contact, date, time, paymentMethod } = req.body;
    
    // Получаем токен и проверяем его
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Необходима авторизация' });
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Неверный токен' });
        }

        // Сохраняем заказ с ФИО пользователя и статусом по умолчанию
        db.get(`SELECT fullname FROM users WHERE id = ?`, [decoded.userId], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            db.run(`INSERT INTO orders (userId, fullname, service, address, contact, date, time, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [decoded.userId, user.fullname, service, address, contact, date, time, paymentMethod, 'В обработке'], 
                    function(err) {
                        if (err) {
                            return res.status(400).json({ message: err.message });
                        }
                        res.status(201).json({ message: 'Заказ создан', id: this.lastID });
                    });
        });
    });
});



// Получение истории заказов
app.get('/orders', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Необходима авторизация' });
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Неверный токен' });
        }

        // Проверка на пользователя adminka
        if (decoded.username === 'adminka') {
            // Если это администратор, возвращаем все заказы
            db.all(`SELECT * FROM orders`, [], (err, rows) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                res.json(rows);
            });
        } else {
            // Если это обычный пользователь, возвращаем только его заказы
            db.all(`SELECT * FROM orders WHERE userId = ?`, [decoded.userId], (err, rows) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }
                res.json(rows);
            });
        }
    });
});



// Обновление статуса заказа
app.put('/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Необходима авторизация' });
    }

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Неверный токен' });
        }

        const query = `UPDATE orders SET status = ?, cancellationReason = ? WHERE id = ?`;
        db.run(query, [status, status === "Отменен" ? cancellationReason : null, id], function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(200).json({ message: 'Статус заказа обновлен' });
        });
    });
});




// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
