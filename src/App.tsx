import logo from "./logo.svg"
import { Counter } from "./features/counter/Counter"
import "./App.css"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter />
        <span>
          <span>Home </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
        </span>
      </header>
    </div>
  )
}

export default App
