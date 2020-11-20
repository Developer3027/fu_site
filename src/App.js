import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/navbar/Navbar'
import './App.css'

function App () {
  return (
    <BrowserRouter>
      <div className='App'>
        <header className='App-header'>
          <Navbar />
        </header>
      </div>
    </BrowserRouter>
  )
}

export default App
