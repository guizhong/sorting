import './App.css'
import { Board } from './components/Board'
import { ResultsModal } from './components/ResultsModal'
import { useGame } from './hooks/useGame'

function App() {
  const game = useGame()

  return (
    <main className="app">
      <header className="appHeader">
        <h1>Medius</h1>
        <p className="tagline">
          Find the <strong>median</strong> of 11 hidden numbers using only
          “which is larger?” comparisons. Compare cards, sort them on the Chain
          Track, then declare the middle one.
        </p>
      </header>

      <Board game={game} />

      {game.state.phase === 'results' && (
        <ResultsModal state={game.state} onPlayAgain={() => game.reset()} />
      )}
    </main>
  )
}

export default App
