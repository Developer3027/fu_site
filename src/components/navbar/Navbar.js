import React from 'react'
import { Link } from 'react-router-dom'

import './Navbar.css'

const Navbar = () => {
  return (
    <nav className='nav-container'>
      <div className=''>
        <Link to='/' className=''>
          <h3>Fathers Together</h3>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
