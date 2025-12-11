import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  test('renders cosmic crypto tracker title', () => {
    render(<App />)
    const titleElement = screen.getByText(/cosmic crypto tracker/i)
    expect(titleElement).toBeInTheDocument()
  })

  test('renders initialization message', () => {
    render(<App />)
    const messageElement = screen.getByText(/dashboard initialization complete/i)
    expect(messageElement).toBeInTheDocument()
  })
})