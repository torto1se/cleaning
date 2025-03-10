import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ErrorMessage from './ErrorMessage'

const services = [
	'Общий клининг',
	'Генеральная уборка',
	'Послестроительная уборка',
	'Химчистка ковров и мебели',
]

const paymentMethods = ['Наличные', 'Банковская карта']

export default function OrderPage() {
	const [service, setService] = useState('')
	const [address, setAddress] = useState('')
	const [contact, setContact] = useState('')
	const [date, setDate] = useState('')
	const [time, setTime] = useState('')
	const [paymentMethod, setPaymentMethod] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const navigate = useNavigate()

	// Проверка на наличие токена
	React.useEffect(() => {
		const token = localStorage.getItem('token')
		if (!token) {
			navigate('/login') // Перенаправление на страницу входа
		}
	}, [navigate])

	const handleOrderSubmit = async () => {
		if (!service || !address || !contact || !date || !time || !paymentMethod) {
			setError('Все поля должны быть заполнены')
			return
		}

		const token = localStorage.getItem('token')

		const response = await fetch('http://localhost:3001/orders', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				service,
				address,
				contact,
				date,
				time,
				paymentMethod,
			}),
		})

		if (response.ok) {
			setSuccess('Заказ успешно отправлен!')
			setError('')
			setService('')
			setAddress('')
			setContact('')
			setDate('')
			setTime('')
			setPaymentMethod('')
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
			{success && (
				<div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>
			)}
			<h3 style={{ marginBottom: '20px' }}>Создать заявку</h3>

			<select
				value={service}
				onChange={e => setService(e.target.value)}
				style={{
					padding: '10px',
					width: '100%',
					maxWidth: '300px',
					marginBottom: '15px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
			>
				<option value=''>Выберите услугу</option>
				{services.map(s => (
					<option key={s} value={s}>
						{s}
					</option>
				))}
			</select>

			<input
				type='text'
				placeholder='Адрес'
				value={address}
				onChange={e => setAddress(e.target.value)}
				style={{
					padding: '10px',
					width: '100%',
					maxWidth: '300px',
					marginBottom: '15px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
			/>

			<input
				type='text'
				placeholder='Контактные данные'
				value={contact}
				onChange={e => setContact(e.target.value)}
				style={{
					padding: '10px',
					width: '100%',
					maxWidth: '300px',
					marginBottom: '15px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
			/>

			<input
				type='date'
				value={date}
				onChange={e => setDate(e.target.value)}
				style={{
					padding: '10px',
					width: '100%',
					maxWidth: '300px',
					marginBottom: '15px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
			/>

			<input
				type='time'
				value={time}
				onChange={e => setTime(e.target.value)}
				style={{
					padding: '10px',
					width: '100%',
					maxWidth: '300px',
					marginBottom: '15px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
			/>

			<select
				value={paymentMethod}
				onChange={e => setPaymentMethod(e.target.value)}
				style={{
					padding: '10px',
					width: '100%',
					maxWidth: '300px',
					marginBottom: '15px',
					borderRadius: '5px',
					border: '1px solid #ccc',
				}}
			>
				<option value=''>Выберите тип оплаты</option>
				{paymentMethods.map(method => (
					<option key={method} value={method}>
						{method}
					</option>
				))}
			</select>

			<button
				onClick={handleOrderSubmit}
				style={{
					padding: '10px 20px',
					backgroundColor: '#007bff',
					color: 'white',
					border: 'none',
					borderRadius: '5px',
					cursor: 'pointer',
				}}
			>
				Отправить заказ
			</button>

			<Link
				to='/order-history'
				style={{
					textDecoration: 'none',
					color: '#007bff',
					marginTop: '10px',
				}}
			>
				История заказов
			</Link>
		</div>
	)
}
