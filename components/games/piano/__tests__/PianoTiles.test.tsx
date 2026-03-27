import React from 'react'
import { render } from '@testing-library/react'
import PianoTiles from '../PianoTiles'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock react-icons
jest.mock('react-icons/hi', () => ({
  HiPlay: () => <div data-testid="hi-play" />,
  HiArrowLeft: () => <div data-testid="hi-arrow-left" />,
  HiStar: () => <div data-testid="hi-star" />,
  HiUser: () => <div data-testid="hi-user" />,
  HiChevronRight: () => <div data-testid="hi-chevron-right" />,
  HiFire: () => <div data-testid="hi-fire" />,
  HiBadgeCheck: () => <div data-testid="hi-badge-check" />,
}))

// Mock sub-components
jest.mock('@/components/games/GameLeaderboard', () => () => <div data-testid="leaderboard" />)
jest.mock('@/components/ads/AdZone', () => () => <div data-testid="ad-zone" />)

describe('PianoTiles Component', () => {
  it('renders the piano game title', () => {
    const { getByText } = render(<PianoTiles />)
    expect(getByText(/Piano/)).toBeTruthy()
    expect(getByText(/Pro/)).toBeTruthy()
  })
})
