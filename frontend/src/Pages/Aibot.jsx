import React from 'react'
import Header from '../components/AiBot/Header'
import Chat from '../components/AiBot/Chat'
import Testimonial from '../components/AiBot/Testimonials'
import Footer from '../components/Navbar/Footer'

const Aibot = () => {
  return (
    <div className="bg-gray-50 flex flex-col min-h-screen">
      <Header/>
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
         <h2 className="text-3xl font-bold text-gray-800 mb-4 tracking-tight text-center">Dashboard AI Assistant</h2>
         <p className="text-gray-600 mb-6 text-center">Ask me anything related to your role-specific context.</p>
         <Chat/>
      </div>
      <Testimonial/>
      <Footer/>
    </div>
  )
}

export default Aibot