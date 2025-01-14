import RegistrationPage from "./components/RegistrationPage";
import React from "react";
import { Route, Routes } from 'react-router-dom'
import LoginPage from "./components/LoginPage";

function App() {
  return (
      <>
       
        <Routes>
          <Route path='/registration' element={<RegistrationPage />} />
          <Route path='/login' element={<LoginPage />} />
        </Routes>
      </>
  )
}

export default App;
