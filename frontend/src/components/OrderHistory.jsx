import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate(); // Хук для навигации

    // Проверка на наличие токена
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login'); // Перенаправление на страницу входа
        } else {
            fetchOrders(token); // Загружаем заказы только если токен есть
        }
    }, [navigate]);

    const fetchOrders = async (token) => {
        const response = await fetch('http://localhost:3001/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setOrders(data);
            setError('');
        } else {
            const data = await response.json();
            setError(data.message);
            setOrders([]);
        }
    };

    return (
        <div>
            <ErrorMessage message={error} />
            <h3>История заказов</h3>
            {orders.length > 0 ? (
                <ul>
                    {orders.map(order => (
                        <li key={order.id}>{order.service} - {order.address} - {order.contact} - {order.date} - {order.time} - {order.paymentMethod}</li>
                    ))}
                </ul>
            ) : (
                <p>Нет заказов.</p>
            )}
           <Link to={'/order'}>Создать заявку</Link> 
        </div>
    );
}
