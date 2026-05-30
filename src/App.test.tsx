import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App — full round', () => {
  it('renders the title and a face-down deck without leaking values', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Medius', level: 1 }),
    ).toBeInTheDocument()

    // All 11 cards start face down; none expose a numeric value (§4.3).
    const faceDown = screen.getAllByLabelText(/face down$/)
    expect(faceDown).toHaveLength(11)
    expect(screen.queryByText(/value \d/)).toBeNull()
    // The seed median value 556 must not be in the DOM during play.
    expect(screen.queryByText('556')).toBeNull()
  })

  it('starts a fresh round when New Game is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Make a comparison so there is state to reset.
    await user.click(screen.getByLabelText('Card A, face down'))
    await user.click(screen.getByLabelText('Card B, face down'))
    await user.click(screen.getByRole('button', { name: /which is larger/i }))
    expect(screen.getByText(/Comparisons:/)).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: /new game/i }))

    // Board is reset: counter back to zero, 11 face-down cards, no leaked values.
    expect(screen.getByText(/Comparisons:/)).toHaveTextContent('0')
    expect(screen.getAllByLabelText(/face down$/)).toHaveLength(11)
    expect(screen.queryByText(/value \d/)).toBeNull()
  })

  it('plays a winning round: compare, declare E, reveal, see diagnosis', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Make one comparison so the counter is non-zero.
    await user.click(screen.getByLabelText('Card A, face down'))
    await user.click(screen.getByLabelText('Card B, face down'))
    await user.click(screen.getByRole('button', { name: /which is larger/i }))
    expect(screen.getByText(/Comparisons:/)).toHaveTextContent('1')

    // Declaring the true median (E in the seed deck) flips all cards at once.
    await user.click(screen.getByRole('button', { name: /declare the median/i }))
    await user.click(screen.getByLabelText('Card E, face down'))

    const dialog = screen.getByRole('dialog', { name: /round results/i })
    expect(within(dialog).getByText('You win!')).toBeInTheDocument()
    expect(within(dialog).getByText(/Clean win/)).toBeInTheDocument()
    // Values are revealed only now, inside the results.
    expect(within(dialog).getAllByText('556').length).toBeGreaterThan(0)
  })

  it('vacates a card from the deck and its pile when placed on the chain track', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Compare A and B; A (872) is larger, so sort A into the LARGER pile.
    await user.click(screen.getByLabelText('Card A, face down'))
    await user.click(screen.getByLabelText('Card B, face down'))
    await user.click(screen.getByRole('button', { name: /which is larger/i }))
    await user.click(screen.getByRole('button', { name: /A → LARGER/i }))

    // A is in the deck (now disabled) and shows in the LARGER pile.
    expect(screen.getByLabelText('Card A, face down')).toBeInTheDocument()
    const larger = screen.getByLabelText('LARGER pile')
    expect(within(larger).getByText('A')).toBeInTheDocument()

    // Move A onto the chain track: select its token, place it in slot 1.
    await user.click(screen.getByRole('button', { name: 'Letter token A' }))
    await user.click(screen.getByRole('button', { name: /Slot 1, empty/i }))

    // A is now ONLY on the track: vacated from the deck and the pile.
    expect(screen.queryByLabelText('Card A, face down')).toBeNull()
    expect(screen.getByLabelText('Card A, on the chain track')).toBeInTheDocument()
    expect(within(larger).queryByText('A')).toBeNull()

    // Taking it off the track returns it to the deck and the pile.
    await user.click(screen.getByRole('button', { name: /Slot 1, token A/i }))
    expect(screen.getByLabelText('Card A, face down')).toBeInTheDocument()
    expect(within(larger).getByText('A')).toBeInTheDocument()
  })

  it('returns all cards in a pile to the deck via the pile button', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Compare A and B; sort A → LARGER.
    await user.click(screen.getByLabelText('Card A, face down'))
    await user.click(screen.getByLabelText('Card B, face down'))
    await user.click(screen.getByRole('button', { name: /which is larger/i }))
    await user.click(screen.getByRole('button', { name: /A → LARGER/i }))

    const larger = screen.getByLabelText('LARGER pile')
    expect(within(larger).getByText('A')).toBeInTheDocument()
    // The card is disabled in the deck while it lives in the pile.
    expect(screen.getByLabelText('Card A, face down')).toBeDisabled()

    // Click "Return all to deck": pile empties, A becomes selectable again.
    await user.click(
      within(larger).getByRole('button', { name: /return all to deck/i }),
    )
    expect(within(larger).queryByText('A')).toBeNull()
    expect(within(larger).getByText('empty')).toBeInTheDocument()
    expect(screen.getByLabelText('Card A, face down')).toBeEnabled()
  })

  it('plays a losing round and shows a diagnosis', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /declare the median/i }))
    await user.click(screen.getByLabelText('Card D, face down')) // rank 1

    const dialog = screen.getByRole('dialog', { name: /round results/i })
    expect(within(dialog).getByText('Not the median')).toBeInTheDocument()
    // Declared with 0 comparisons → premature declaration diagnosis.
    expect(within(dialog).getByText(/cannot be determined/i)).toBeInTheDocument()
  })
})
