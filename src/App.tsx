import { useGame } from './hooks/useGame';
import { Board } from './components/Board';

function App() {
  const game = useGame();

  return (
    <Board
      state={game.state}
      onCompare={game.compare}
      onPlaceInPile={game.placeInPile}
      onChainMove={game.chainMove}
      onSelectCard={game.selectCard}
      onDeclare={game.declare}
      onReveal={game.reveal}
      onReset={game.reset}
    />
  );
}

export default App;