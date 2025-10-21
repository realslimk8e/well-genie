// __tests__/ui.mvp.spec.tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { test, expect } from 'vitest';
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// ---- Mocks ----
// Mock axios so App.tsx’s /api/ call doesn’t hit the network
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { message: 'Hello from API' } })),
  },
}))

// Mock Recharts to avoid SVG/layout complexity during unit tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
}))

// ---- SUT imports (match your project layout) ----
import App from '../../App'
import Sidebar from '../Sidebar'
import MobileTabBar from '../MobileTabBar'
import SummaryCard from '../SummaryCard'
import WeeklyOverview from '../WeeklyOverview'
import ChatbotPanel from '../panels/ChatbotPanel'

// 1) App smoke: title + default subtitle, then axios message appears
test('App shows title, default subtitle, and swaps to API message', async () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /wellgenie dashboard/i })).toBeInTheDocument()
  // Default subtitle before axios resolves
  expect(screen.getByText(/ui only right now, backend can come later/i)).toBeInTheDocument()
  // After axios resolves (mocked)
  expect(await screen.findByText(/hello from api/i)).toBeInTheDocument()
})

// 2) Sidebar: aria-current toggles when navigating
test('Sidebar marks the active item with aria-current', async () => {
  const user = userEvent.setup()
  let current: any = 'overview'
  const onNavigate = (k: any) => {
    current = k
    rerender(<Sidebar current={current} onNavigate={onNavigate} />)
  }
  const { rerender } = render(<Sidebar current={current} onNavigate={onNavigate} />)
  const nav = screen.getByRole('navigation', { name: /primary/i })
  const overviewBtn = within(nav).getByRole('button', { name: /overview/i })
  expect(overviewBtn).toHaveAttribute('aria-current', 'page')

  const sleepBtn = within(nav).getByRole('button', { name: /sleep/i })
  await user.click(sleepBtn)
  expect(sleepBtn).toHaveAttribute('aria-current', 'page')
  expect(overviewBtn).not.toHaveAttribute('aria-current')
})

// 3) SummaryCard: value/unit/hint rendering
test('SummaryCard renders title, value, optional unit and hint', () => {
  const { rerender } = render(<SummaryCard title="Sleep" value="8.0" unit="h" hint="avg last 7d" accent="purple" />)
  expect(screen.getByText(/sleep/i)).toBeInTheDocument()
  expect(screen.getByText('8.0')).toBeInTheDocument()
  expect(screen.getByText('h')).toBeInTheDocument()
  expect(screen.getByText(/avg last 7d/i)).toBeInTheDocument()

  rerender(<SummaryCard title="Steps" value="9200" />)
  expect(screen.getByText('9200')).toBeInTheDocument()
  expect(screen.queryByText('h')).not.toBeInTheDocument()
})

// 4) WeeklyOverview: both charts mount and captions exist
test('WeeklyOverview renders sleep and steps sections', () => {
  const data = [
    { day: 'Mon', sleepHrs: 7.6, steps: 8200 },
    { day: 'Tue', sleepHrs: 8.1, steps: 9000 },
  ]
  render(<WeeklyOverview data={data} />)
  expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  expect(screen.getByText(/sleep, hours/i)).toBeInTheDocument()
  expect(screen.getByText(/steps/i)).toBeInTheDocument()
})

// 5) ChatbotPanel: basic input and button exist
test('ChatbotPanel shows input and Send button', () => {
  render(<ChatbotPanel />)
  expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
})

afterEach(() => {
  cleanup()               // remove any mounted DOM between tests
  vi.resetAllMocks()      // reset mock implementations/call history
  vi.restoreAllMocks()    // restore spied implementations
})
