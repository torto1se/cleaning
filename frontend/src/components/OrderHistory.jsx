import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'

export default function OrderHistory() {
	const [orders, setOrders] = useState([])
	const [error, setError] = useState('')
	const navigate = useNavigate() // Хук для навигации

	// Состояние для хранения выбранного статуса для каждого заказа
	const [selectedStatuses, setSelectedStatuses] = useState({})
	const [cancellationReasons, setCancellationReasons] = useState({}) // Состояние для хранения причин отмены

	// Проверяем, является ли пользователь администратором
	const isAdmin = () => {
		const token = localStorage.getItem('token')
		if (!token) return false
		const decodedToken = JSON.parse(atob(token.split('.')[1]))
		return decodedToken.username === 'adminka'
	}

	// Проверка на наличие токена и определение роли
	useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) {
			navigate('/login') // Перенаправление на страницу входа
		} else {
			fetchOrders(token) // Загружаем заказы только если токен есть
		}
	}, [navigate])

	const fetchOrders = async token => {
		const response = await fetch('http://localhost:3001/orders', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (response.ok) {
			const data = await response.json()
			setOrders(data)
			setError('')
			const initialStatuses = {}
			data.forEach(order => {
				initialStatuses[order.id] = '' // Устанавливаем пустое значение по умолчанию
				setCancellationReasons(prev => ({ ...prev, [order.id]: '' })) // Инициализируем причины отмены
			})
			setSelectedStatuses(initialStatuses)
		} else {
			const data = await response.json()
			setError(data.message)
			setOrders([])
		}
	}

	const handleStatusChange = (orderId, newStatus) => {
		setSelectedStatuses(prev => ({
			...prev,
			[orderId]: newStatus,
		}))

		// Если статус "Отменен", показываем поле для причины отмены
		if (newStatus === 'Отменен') {
			setCancellationReasons(prev => ({ ...prev, [orderId]: '' })) // Сбрасываем причину отмены при изменении статуса
		}
	}

	const updateStatus = async orderId => {
		const token = localStorage.getItem('token')

		const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				status: selectedStatuses[orderId],
				cancellationReason: cancellationReasons[orderId],
			}),
		})

		if (response.ok) {
			fetchOrders(token)
		} else {
			const data = await response.json()
			setError(data.message)
		}
	}

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				padding: '20px',
				borderRadius: '10px',
				boxShadow: '0 0 10px rgba(0,0,0,0.1)',
			}}
		>
			<ErrorMessage message={error} />
			<h3 style={{ marginBottom: '20px' }}>История заказов</h3>
			{orders.length > 0 ? (
				<table
					style={{
						borderCollapse: 'collapse',
						width: '100%',
						backgroundColor: 'white',
						boxShadow: '0 0 10px rgba(0,0,0,0.1)',
						borderRadius: '5px',
					}}
				>
					<thead>
						<tr>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								ФИО
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Услуга
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Адрес
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Контакт
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Дата
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Время
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Способ оплаты
							</th>
							<th
								style={{
									border: '1px solid #ddd',
									padding: '8px',
									backgroundColor: '#f5f5f5',
								}}
							>
								Статус
							</th>
							{isAdmin() && (
								<th
									style={{
										border: '1px solid #ddd',
										padding: '8px',
										backgroundColor: '#f5f5f5',
									}}
								>
									Действия
								</th>
							)}
						</tr>
					</thead>
					<tbody>
						{orders.map(order => (
							<tr key={order.id}>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.fullname}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.service}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.address}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.contact}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.date}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.time}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.paymentMethod}
								</td>
								<td style={{ border: '1px solid #ddd', padding: '8px' }}>
									{order.status}
									{order.status === 'Отменен' &&
										order.cancellationReason &&
										` - Причина: ${order.cancellationReason}`}
								</td>
								{isAdmin() && (
									<td style={{ border: '1px solid #ddd', padding: '8px' }}>
										<select
											value={selectedStatuses[order.id] || ''}
											onChange={e =>
												handleStatusChange(order.id, e.target.value)
											}
											style={{
												padding: '5px',
												width: '100%',
												maxWidth: '150px',
												borderRadius: '5px',
												border: '1px solid #ccc',
											}}
										>
											<option value='' disabled>
												Выберите статус
											</option>
											<option value='В обработке'>В обработке</option>
											<option value='Завершен'>Завершен</option>
											<option value='Отменен'>Отменен</option>
										</select>
										{selectedStatuses[order.id] === 'Отменен' && (
											<>
												<input
													type='text'
													placeholder='Причина отмены'
													value={cancellationReasons[order.id]}
													onChange={e =>
														setCancellationReasons(prev => ({
															...prev,
															[order.id]: e.target.value,
														}))
													}
													style={{
														padding: '5px',
														width: '100%',
														maxWidth: '150px',
														borderRadius: '5px',
														border: '1px solid #ccc',
														marginTop: '5px',
													}}
												/>
											</>
										)}

										<button
											onClick={() => updateStatus(order.id)}
											style={{
												padding: '5px 10px',
												backgroundColor: '#007bff',
												color: 'white',
												border: 'none',
												borderRadius: '5px',
												cursor: 'pointer',
												marginTop: '5px',
											}}
										>
											Обновить статус
										</button>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<p style={{ color: 'gray' }}>Нет заказов.</p>
			)}
			<Link
				to={'/order'}
				style={{
					textDecoration: 'none',
					color: '#007bff',
					marginTop: '10px',
				}}
			>
				Создать заявку
			</Link>
		</div>
	)
}
