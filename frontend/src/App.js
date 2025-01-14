import RegistrationPage from "./components/RegistrationPage";
import React from "react";
import { Route, Routes } from 'react-router-dom'
import LoginPage from "./components/LoginPage";
import OrderPage from "./components/OrderPage";
import OrderHistory from "./components/OrderHistory";

function App() {
  return (
      <>
       
        <Routes>
          <Route path='/registration' element={<RegistrationPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
        </Routes>
      </>
  )
}

export default App;
