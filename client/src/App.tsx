import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import  Auth from './pages/Auth'
import Home from './pages/Home'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
export const ServerUrl = "http://localhost:8000"


const App = () => {

  const dispatch = useDispatch();

  useEffect(()=>{
    const getUser = async()=>{
      try {
        const res = await axios.get(`${ServerUrl}/api/user/current-user`,{
          withCredentials: true
        })
        dispatch(setUserData(res.data))
        
        console.log(res.data)
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))

      }
    }

    getUser();
  },[])
  return (
     <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
    </Routes>
  )
}

export default App
