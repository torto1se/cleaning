import React, { useState } from "react";
import { Link } from 'react-router-dom';
import ErrorMessage from './ErrorMessage'; // Импортируем компонент

export default function RegistrationPage() {
    const [username, setUsername] = useState('');
    const [fullname, setFullname] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
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

    const handleRegister = async () => {
        if (!username || !fullname || !phone || !email || !password) {
            setError('Все поля должны быть заполнены');
            setTimeout(() => setError(''), 3000)
            return;
        }

        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, fullname, phone, email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Регистрация успешна!');
            setError(''); // Сброс ошибки при успешной регистрации
        } else {
            setError(data.error); // Устанавливаем сообщение об ошибке
        }
    };

    return (
        <div>
            <ErrorMessage message={error} /> {/* Отображаем сообщение об ошибке */}
            <div style={{width:"100%", justifyContent:"center", display:"flex", alignItems:"center", height:"100vh"}}>
                <div style={{border: '2px solid black', borderRadius:'10px'}}>
                    <div style={{gap:"2px", display:"flex", flexDirection:"column", width: "300px", margin:'40px', alignItems:'center'} }>
                        <h3 style={{textAlign:"center", color:"green",  marginBottom:'40px'}}>Регистрация</h3>
                        <input type="text" placeholder="Логин" style={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input type="text" placeholder="ФИО" style={styles.input} value={fullname} onChange={(e) => setFullname(e.target.value)} />
                        <input type="text" placeholder="Телефон" style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <input type="text" placeholder="Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="password" placeholder="Пароль" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={handleRegister} style={{marginTop:"10px", cursor:'pointer', color:'white', backgroundColor:'black', border: 'none', padding:'10px', borderRadius:'10px', width:'180px'}}>Зарегистрироваться</button>
                        <p style={{textAlign:'center'}}>Уже есть аккаунт? <Link to="/login" style={{textDecoration:'none', color:"black"}}> Войти </Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
