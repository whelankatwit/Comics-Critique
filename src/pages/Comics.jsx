import { useState } from 'react'
import Banner from '../components/Banner'
import NavBar from '../components/NavBar'
import ComicsList from '../components/ComicsList'

function Comics() {

  return (
    <div>
        <div className="bg-primary-subtle">
          <div className="text-center mt-16 p-4">
            <p>This is the Comics page.</p>
          </div>
          <ComicsList />
        </div>
    </div>
    
  )
}

export default Comics;