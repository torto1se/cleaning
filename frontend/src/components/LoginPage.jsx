import React, { useState } from "react";
import { Link } from 'react-router-dom';
import ErrorMessage from './ErrorMessage'; // Импортируем компонент

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Состояние для ошибок

    const styles = {
        input: {
            outline: "none",
            border: 'none',
            borderBottom: '1px solid black',
            paddingBottom: '5px',
            paddingLeft: '0px',
            marginBottom: '15px',
            width: '200px',
        }
    };

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Все поля должны быть заполнены');
            setTimeout(() => setError(''), 5000); // Убираем сообщение об ошибке через 5 секунд
            return;
        }

        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Вход успешен! Токен:', data.token);
            setError(''); // Сброс ошибки при успешном входе
        } else {
            setError(data.message); // Устанавливаем сообщение об ошибке
            setTimeout(() => setError(''), 5000); // Убираем сообщение об ошибке через 5 секунд
        }
    };

    return (
        <div>
            <ErrorMessage message={error} /> {/* Отображаем сообщение об ошибке */}
            <div style={{width:"100%", justifyContent:"center", display:"flex", alignItems:"center", height:"100vh"}}>
                <div style={{border: '2px solid black', borderRadius:'10px'}}>
                    <div style={{gap:"2px", display:"flex", flexDirection:"column", width: "300px", margin:'30px', alignItems:'center'} }>
                        <h3 style={{textAlign:"center", color:"green", marginBottom:'40px'}}>Авторизация</h3>
                        <input type="text" placeholder="Логин" style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="password" placeholder="Пароль" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={handleLogin} style={{marginTop:"10px", cursor:'pointer', color:'white', backgroundColor:'black', border: 'none', padding:'10px', borderRadius:'10px', width:'180px'}}>Войти</button>
                        <p style={{textAlign:'center'}}>Нет аккаунта? <Link to="/registration" style={{textDecoration:'none', color:"black"}}> Зарегистрироваться </Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
