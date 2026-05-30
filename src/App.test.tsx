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

  it('plays a winning round: compare, declare E, reveal, see diagnosis', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Make one comparison so the counter is non-zero.
    await user.click(screen.getByLabelText('Card A, face down'))
    await user.click(screen.getByLabelText('Card B, face down'))
    await user.click(screen.getByRole('button', { name: /which is larger/i }))
    expect(screen.getByText(/Comparisons:/)).toHaveTextContent('1')

    // Declare the true median (E in the seed deck).
    await user.click(screen.getByRole('button', { name: /declare the median/i }))
    await user.click(screen.getByLabelText('Card E, face down'))
    await user.click(screen.getByRole('button', { name: /reveal & verify/i }))

    const dialog = screen.getByRole('dialog', { name: /round results/i })
    expect(within(dialog).getByText('You win!')).toBeInTheDocument()
    expect(within(dialog).getByText(/Clean win/)).toBeInTheDocument()
    // Values are revealed only now, inside the results.
    expect(within(dialog).getAllByText('556').length).toBeGreaterThan(0)
  })

  it('plays a losing round and shows a diagnosis', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /declare the median/i }))
    await user.click(screen.getByLabelText('Card D, face down')) // rank 1
    await user.click(screen.getByRole('button', { name: /reveal & verify/i }))

    const dialog = screen.getByRole('dialog', { name: /round results/i })
    expect(within(dialog).getByText('Not the median')).toBeInTheDocument()
    // Declared with 0 comparisons → premature declaration diagnosis.
    expect(within(dialog).getByText(/cannot be determined/i)).toBeInTheDocument()
  })
})
