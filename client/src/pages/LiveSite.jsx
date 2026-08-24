import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useParams } from 'react-router-dom'
import { serverUrl } from '../App';
import { useState } from 'react';

function LiveSite() {
    const {id}=useParams()
    const [html,setHtml]=useState("")
    const [error,setError]=useState("")
    
  useEffect(() => {
    const getWebsite = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/website/get-by-slug/${id}`,
          { withCredentials: true }
        );
      setHtml(res.data.latestCode)
      } catch (err) {
       console.log(err)
    setError("site not found")      }
    };
    getWebsite();
  }, [id]);
     if(error){
        return (
            <div className='h-screen flex items-center justify-center bg-black
            text-white'>
                {error}
            </div>
        )
     } 
  
  return (
       <iframe  title='Live Site' srcDoc={html} className='w-screen h-screen 
       border-none' sandbox='allow-scripts allow-same-origin allow-forms' />
    )
}
export default LiveSite


































