import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import InterviewStep3 from '../components/InterviewStep3';
const ServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
const InterviewReport = () => {
  const {id} = useParams();

  const [report,setReport] = useState(null);

  useEffect(()=>{
    const fetchReport = async()=>{
      try {
        const response = await axios.get(ServerUrl+'/api/interview/report/'+ id,{
          withCredentials:true
        });
        console.log(response.data);
        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    }
    fetchReport();
  }, [id])

  if(!report){
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className="text-gray-500 text-lg">
          Loading Report...
        </p>
      </div>
    )
  }
  return (
    <InterviewStep3 report={report} />
  )
}

export default InterviewReport
