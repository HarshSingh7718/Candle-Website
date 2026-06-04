import React from 'react'
import { NavLink } from 'react-router-dom'

const NavMenu = ({ name, path }) => {
  return (
    <NavLink
      to={path}
      className="text-sm md:text-[16px] font-medium text-text-on-brand nav-link"
    >
      {name}
    </NavLink>
  )
}

export default NavMenu
