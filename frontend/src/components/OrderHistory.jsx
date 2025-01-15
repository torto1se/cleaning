import React, { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import ErrorMessage from './ErrorMessage';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Хук для навигации

    // Состояние для хранения выбранного статуса для каждого заказа
    const [selectedStatuses, setSelectedStatuses] = useState({});
    const [cancellationReasons, setCancellationReasons] = useState({}); // Состояние для хранения причин отмены
    
    // Проверяем, является ли пользователь администратором
    const isAdmin = () => {
        const token = localStorage.getItem('token');
        if (!token) return false; 
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        return decodedToken.username === 'adminka'; 
    };

    // Проверка на наличие токена и определение роли
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
            const initialStatuses = {};
            data.forEach(order => {
                initialStatuses[order.id] = ''; // Устанавливаем пустое значение по умолчанию
                setCancellationReasons(prev => ({ ...prev, [order.id]: '' })); // Инициализируем причины отмены
            });
            setSelectedStatuses(initialStatuses);
        } else {
            const data = await response.json();
            setError(data.message);
            setOrders([]);
        }
    };

    const handleStatusChange = (orderId, newStatus) => {
        setSelectedStatuses(prev => ({
            ...prev,
            [orderId]: newStatus,
        }));
        
        // Если статус "Отменен", показываем поле для причины отмены
        if (newStatus === "Отменен") {
            setCancellationReasons(prev => ({ ...prev, [orderId]: '' })); // Сбрасываем причину отмены при изменении статуса
        }
    };

    const updateStatus = async (orderId) => {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                status: selectedStatuses[orderId], 
                cancellationReason: cancellationReasons[orderId] 
            }),
        });

        if (response.ok) {
            fetchOrders(token);
        } else {
            const data = await response.json();
            setError(data.message);
        }
    };

    return (
        <div>
            <ErrorMessage message={error} />
            <h3>История заказов</h3>
            {orders.length > 0 ? (
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid black', padding: '8px' }}>ФИО</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Услуга</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Адрес</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Контакт</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Дата</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Время</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Способ оплаты</th>
                            <th style={{ border: '1px solid black', padding: '8px' }}>Статус</th>
                            {isAdmin() && <th style={{ border: '1px solid black', padding: '8px' }}>Действия</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.fullname}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.service}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.address}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.contact}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.date}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.time}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>{order.paymentMethod}</td>
                                <td style={{ border: '1px solid black', padding: '8px' }}>
                                    {order.status} 
                                    {order.status === "Отменен" && order.cancellationReason && ` - Причина: ${order.cancellationReason}`}
                                </td>
                                {isAdmin() && (
                                    <td style={{ border: '1px solid black', padding: '8px' }}>
                                        <select 
                                            value={selectedStatuses[order.id] || ''} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)} 
                                        >
                                            <option value="" disabled>Выберите статус</option>
                                            <option value="В обработке">В обработке</option>
                                            <option value="Завершен">Завершен</option>
                                            <option value="Отменен">Отменен</option>
                                        </select>
                                        {selectedStatuses[order.id] === "Отменен" && (
                                            <>
                                                <input 
                                                    type="text" 
                                                    placeholder="Причина отмены" 
                                                    value={cancellationReasons[order.id]} 
                                                    onChange={(e) => setCancellationReasons(prev => ({ ...prev, [order.id]: e.target.value }))} 
                                                />
                                            </>
                                        )}

                                        <button onClick={() => updateStatus(order.id)}>Обновить статус</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Нет заказов.</p>
            )}
           <Link to={'/order'}>Создать заявку</Link> 
        </div>
    );
}
