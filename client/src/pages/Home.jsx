import  {useEffect, useState} from 'react'
import {AnimatePresence, motion} from "motion/react"
import LoginModal from '../components/LoginModal.jsx'
import { useDispatch, useSelector } from 'react-redux'
import { Coins } from 'lucide-react'
import { serverUrl } from '../App.jsx'
import axios from 'axios'
import { setUserData } from '../redux/userSlice.js'
import { Navigate, useNavigate } from 'react-router-dom'
function Home(){
   const highlights=[
    "AI Generated Code",
    "Fully Responsive Layouts",
    "Production Ready Output",
   ]

   const [openLogin,setOpenLogin]=useState(false)
   const {userData}  =useSelector(state=>state.user)
   const [openProfile, setOpenProfile]=useState(false)
   const [websites,setWebsites]=useState(null)
   const dispatch=useDispatch()
   const navigate=useNavigate()
   const handleLogOut=async ()=>{
    console.log("logout click")
    try {
      
      await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      dispatch(setUserData(null))
      setOpenProfile(false)
    } catch (error) {
      console.log(error)
    }
   }

   
    useEffect (() => {
      if(!userData) return;
       const handleGetAllWebsite = async () => {
        
   
         try {
           const result = await axios.get(
             `${serverUrl}/api/website/get-all`,
             { withCredentials: true }
           );
   
           setWebsites(result.data || []);
         } catch (error) {
           console.log(error);
           setError(error.response?.data?.message || "Something went wrong");
         }
   
        
       };
   
       handleGetAllWebsite();
     }, [userData]);
  return (
    <div className='relative min-h-screen bg-[#040404] text-white 
    overflow-hidden'>
    <motion.div
    initial={{y:-40,opacity:0}}
    animate={{y:0,opacity:1}}
    transition={{duration:1}}
    className='fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40
    border-b border-white/10'
    >
    <div className='max-w-7xl mx-auto px-6 py-4 flex justify-between items-center'>
   <div className='text-lg font-semibold'>
    GenWeb.ai
   </div>
   <div className='flex items-center gap-5'>
  
  
    {!userData ? <button className='px-4 py-2 rounded-lg border-white/20 hover:bg-white/10 text-sm'
   onClick={()=>setOpenLogin(true)}>
   
    Get started
   </button> :
   <div className='relative'>
   <button className='flex items-center' onClick={()=>setOpenProfile(!openProfile)}>
    <img src={userData.avata || `https://ui-avatars.com/api/?name=${userData.name}` } alt=""  referrerPolicy='no-referrer'
    className='w-9 h-9 rounded-full border border-white/20
    object-cover'/>
    </button>
       
       <AnimatePresence>
        {openProfile && (
          <>
          <motion.div
          initial={{opacity:0, y:-10, scale:0.95}}
          animate={{opacity:1, y:0,scale:1}}
          exit={{opacity:0,y:-10, scale:0.95}}
          className='absolute right-0 mt-3 w-60 z-50 rounded-xl
          bg-[#0b0b0b] border border-white/10 shadow-2xl
          overflow-hidden
          '>
            <div className='px-4 py-3 border-b border-white/10'>
            <p className='text-sm font-medium truncate'>{userData.name}</p>
            <p className='text-xs text-zinc-500 truncate'>{userData.email}</p>

            </div>
            <button className='md:hidden w-full px-4 py-4 flex item-center
            gap-2 text-sm border-b border-white/10
            hover:bg-white/5'>
            <span className='font-semibold'>+</span>
            </button>

           <button className='w-full px-4 py-3 text-left text-sm
           hover:bg-white/5' onClick={()=>navigate("/dashboard")}>Dashboard</button>
           <button className='w-full px-4 py-3 text-left text-sm
           text-red-400 hover:bg-white/5' onClick={handleLogOut}>Logout</button>

            </motion.div></>
        )}
       </AnimatePresence>
    </div>
    }  
   
   </div>
    </div>
    </motion.div>

       <section className='pt-44 pb-32 px-6 text-center'>
        <motion.h1
        initial={{ opacity:0, y:40}}
        animate={{opacity:1,y:0}}
        className="text=5xl md:text-7xl font-bold tracking-tight"
        >
           Build Stunning Websites  <br />
          <span className='bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text
          text-transparent'>with AI</span>
           
           </motion.h1>
           <motion.p 
           initial={{ opacity:0, y:20}}
        animate={{opacity:1,y:0}}
        className='mt-8 max-w-2xl mx-auto text-zinc-400 text-lg'
        >
             Describe your idea and let AI generate a modern,
             responsive, production-ready website.
           </motion.p>

         
             <button className="px-10 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105
             transition mt-12" onClick={()=>userData? navigate("/dashboard")
              :setOpenLogin(true)  
             }>
           { userData?"Go to dashboard":"Get Started"}
           </button>
         
       </section>
       {!userData &&   <section className='max-w-7xl mx-auto px-6 pb-32'>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
            {highlights.map((h,i)=>(
             
                <motion.div
                key={i}
                initial={{ opacity:0, y:40}}
                whileInView={{ opacity:1,y:0}}
                className='rounded-2xl bg-white/5 border border-white/10 p-8'
                >
                  <h1 className='text-xl font-semibold mb-3'>{h}</h1>
                  <p className='text-sm text-zinc-400'>
                    GenWeb.ai builds real websites - clean code,
                    animations, responsiveness and scalable structure.
                  </p>
                </motion.div> 
            ))}
          </div>

       </section> }
          
          {userData && websites?.length>0 && (
            <section className='max-w-7xl mx-auto px-6 pb-32'>
              <h3 className='text-2xl font-semibold mb-6'>Your Websites</h3>

             <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {websites.slice(0,3).map((w,i) => (
                <motion.div
                key={w._id}
                whileHover={{ y: -6}}
                onClick={() => navigate(`/editor/${w._id}`)}
                className="cursor-pointer rounded-2xl bg-white/5 border
                border-white/10 overflow-hidden"
                >
                 <div className='h-40 bg-black'>
                  <iframe  srcDoc={w.latestCode}
                  className='w-[140%] h-[140%] scale-[0.72] origin-top-left pointer-events-none bg-white'
                  />
                 </div>

                <div className='p-4'>
                      <h3 className="text-base font-semibold line-clamp-2">
                      {w.title}
                    </h3>

                    <p className="text-xs text-zinc-400">
                      Last Update{" "}
                      {new Date(w.updatedAt).toLocaleDateString()}
                    </p>
                </div>
                </motion.div>
              ))}
              </div> 
            </section>
          )}
       <footer className='border-t border-white/10 py-10 text-center text-sm text-zinc-500'>
        &copy; {new Date().getFullYear()} GenWeb.ai
       </footer>
       {openLogin && <LoginModal open={openLogin} onClose={()=>setOpenLogin(false)}/>}
    </div>
  )
}

export default Home





//    <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxIRERUTExMSFRIXGB0YFRcWFRYVFxgTFRUWFxcXFRYaHSkiGRolGxUVITEhJSstLi4uGB8zODMtOSgtLisBCgoKDg0OGxAQGzAlICEuLS43NS0rLTUtKysuLS0tLi0tLy0tNTctLS0tLS0tLS8zKy4tLS0tLSstKy0tLS0tLf/AABEIALwBDQMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABQcEBgECAwj/xABCEAABAwICBQoCCAQFBQAAAAABAAIDBBEFEgYTISIxBxQyQVFhcYGRoVJyIzNCc4KSsdFiosHCJERTg7IVF0Nj8P/EABkBAQADAQEAAAAAAAAAAAAAAAACAwQBBf/EAC8RAQACAgAFAgQDCQAAAAAAAAABAgMRBBIhMVFhoUGBkbETMnEFFCJCQ8HR4fD/2gAMAwEAAhEDEQA/AKiREUnBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAXZsZIJAJDRdxAJAHa4jgO8ror95L9H209A3O0Z6gZ5QRxY4WYw9wYeHa5yje8VSiu1BopnTDBDQ1s1PtyNOaMnriftZ42G74tKhlJEREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERBLaJ4RzysigtuudeT7pm1/qN3xcF9KwBVVyM4RlZLVOG151cfyNN3keLrD8CtWBYr5ObLrw01rqm/KtuXHBc0cVY0b0Z1Uh/9bzdhPg+4/3FTq+otIsObU08sD+jIwtv2EjY4d4Nj5L5hqIHRvdG8Wexxa4fxNNj7ha6z8FEw80RFJEREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQF3ghc9zWNF3uIa0drnGwHqV0W58leE66sMxG5A3N/uPu1g8hnPkFXlyRjpNp+CdK81oqt3AMPbTQRQN4RtDb9pHSd4k3PmsjRzHIqvXav/AMMroXd5ZbeHcb+yi9KcX5pRzTA2cG2Z94/dZ7kHyVcci+LamtMBO5Oywv8A6sd3N9W5x6LBwlJtWby1Z7RExWF4VXBURysYTqazXNG5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" alt="" className='w-9 h-9 rounded-full border border-white/20 object-cover'/>
