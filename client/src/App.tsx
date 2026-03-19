import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import  Auth from './pages/Auth'
import Home from './pages/Home'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice'
import InterviewPage from './pages/InterviewPage'
export const ServerUrl = "http://localhost:8000"


const App = () => {

  const dispatch = useDispatch();

  useEffect(()=>{
    const getUser = async()=>{
      try {
        const res = await axios.get(`${ServerUrl}/api/user/current-user`,{
          withCredentials: true
        })
        dispatch(setUserData(res.data.user))
        
        console.log(res.data)
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))

      }
    }

    getUser();
  },[dispatch])
  return (
     <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/interview' element={<InterviewPage />} />
    </Routes>
  )
}

export default App
