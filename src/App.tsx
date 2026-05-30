import './App.css'
import { Board } from './components/Board'
import { ResultsModal } from './components/ResultsModal'
import { useGame } from './hooks/useGame'
import { randomSeed } from './game'

function App() {
  const game = useGame()

  // Each new game shuffles in a freshly seeded deck.
  const newGame = () => game.reset(randomSeed())

  return (
    <main className="app">
      <header className="appHeader">
        <h1>Medius</h1>
        <p className="tagline">
          Find the <strong>median</strong> of 11 hidden numbers using only
          “which is larger?” comparisons. Compare cards, sort them on the Chain
          Track, then declare the middle one.
        </p>
        <button type="button" className="newGame" onClick={newGame}>
          New Game
        </button>
      </header>

      <Board game={game} />

      {game.state.phase === 'results' && (
        <ResultsModal state={game.state} onPlayAgain={newGame} />
      )}
    </main>
  )
}

export default App
