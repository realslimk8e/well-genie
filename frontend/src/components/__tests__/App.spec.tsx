import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../../App';
import axios from 'axios';
import { useSleep } from '../../hooks/useSleep';
import { useDiet } from '../../hooks/useDiet';
import { useExercise } from '../../hooks/useExercise';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

// Mock child components to isolate App.tsx logic
vi.mock('../../components/Sidebar', () => ({
  default: ({
    onNavigate,
    onLogout,
  }: {
    onNavigate: (tab: string) => void;
    onLogout: () => void;
  }) => (
    <div data-testid="sidebar">
      <button onClick={() => onNavigate('overview')}>Overview</button>
      <button onClick={() => onNavigate('sleep')}>Sleep Nav</button>
      <button onClick={() => onNavigate('diet')}>Diet Nav</button>
      <button onClick={() => onNavigate('exercise')}>Exercise Nav</button>
      <button onClick={() => onNavigate('chatbot')}>Chatbot Nav</button>
      <button onClick={() => onNavigate('settings')}>Settings Nav</button>
      <button onClick={() => onNavigate('import')}>Import Nav</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

vi.mock('../../components/panels/SleepPanel', () => ({
  default: () => <div>Sleep Panel</div>,
}));
vi.mock('../../components/panels/DietPanel', () => ({
  default: () => <div>Diet Panel</div>,
}));
vi.mock('../../components/panels/ExercisePanel', () => ({
  default: () => <div>Exercise Panel</div>,
}));
vi.mock('../../components/panels/ChatbotPanel', () => ({
  default: () => <div>Chatbot Panel</div>,
}));
vi.mock('../../components/panels/SettingsPanel', () => ({
  default: () => <div>Settings Panel</div>,
}));
vi.mock('../../components/ImportPage', () => ({
  default: () => <div>Import Page</div>,
}));

// DON'T mock Login/Signup - let the real components render so data-testid works
// vi.mock('../../components/Login');
// vi.mock('../../components/Signup');

// Mock hooks
vi.mock('../../hooks/useSleep');
vi.mock('../../hooks/useDiet');
vi.mock('../../hooks/useExercise');

describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hash: '' },
    });
    vi.clearAllMocks();

    // Provide default mock return values for hooks
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });
  });

  it('renders Login component when not authenticated', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));
    render(<App />);
    expect(await screen.findByTestId('login-form')).toBeInTheDocument();
  });

  it('shows SignUp component when "Sign up" is clicked', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));
    render(<App />);

    const loginForm = await screen.findByTestId('login-form');
    const signUpLink = within(loginForm).getByText(/sign up/i);
    fireEvent.click(signUpLink);

    expect(await screen.findByTestId('signup-form')).toBeInTheDocument();
  });

  it('renders the main application when authenticated', async () => {
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    render(<App />);
    expect(await screen.findByText('WellGenie Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Avg Sleep (7d)')).toBeInTheDocument();
  });

  it('handles navigation between panels', async () => {
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    render(<App />);
    expect(await screen.findByText('WellGenie Dashboard')).toBeInTheDocument();

    const sidebar = screen.getByTestId('sidebar');

    // Navigate to Sleep panel
    fireEvent.click(within(sidebar).getByText('Sleep Nav'));
    expect(await screen.findByText('Sleep Panel')).toBeInTheDocument();

    // Navigate to Diet panel
    fireEvent.click(within(sidebar).getByText('Diet Nav'));
    expect(await screen.findByText('Diet Panel')).toBeInTheDocument();

    // Navigate to Exercise panel
    fireEvent.click(within(sidebar).getByText('Exercise Nav'));
    expect(await screen.findByText('Exercise Panel')).toBeInTheDocument();

    // Navigate to Chatbot panel
    fireEvent.click(within(sidebar).getByText('Chatbot Nav'));
    expect(await screen.findByText('Chatbot Panel')).toBeInTheDocument();

    // Navigate to Settings panel
    fireEvent.click(within(sidebar).getByText('Settings Nav'));
    expect(await screen.findByText('Settings Panel')).toBeInTheDocument();

    // Navigate to Import panel
    fireEvent.click(within(sidebar).getByText('Import Nav'));
    expect(await screen.findByText('Import Page')).toBeInTheDocument();
  });

  it('handles logout', async () => {
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    mockedAxios.post.mockResolvedValue({ status: 200 });
    render(<App />);

    expect(await screen.findByText('WellGenie Dashboard')).toBeInTheDocument();

    // After logout, GET is called again to check auth, which we'll say fails
    mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));

    fireEvent.click(screen.getByText('Logout'));

    // We need to wait for the state to update and re-render
    expect(await screen.findByTestId('login-form')).toBeInTheDocument();
  });

  it('switches from signup to login view', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Not authenticated'));
    render(<App />);

    // Go to sign up page
    const loginForm = await screen.findByTestId('login-form');
    const signUpLink = within(loginForm).getByText(/sign up/i);
    fireEvent.click(signUpLink);

    const signupForm = await screen.findByTestId('signup-form');
    expect(signupForm).toBeInTheDocument();

    // Go back to login page
    const loginLink = within(signupForm).getByText(/log in/i);
    fireEvent.click(loginLink);

    expect(await screen.findByTestId('login-form')).toBeInTheDocument();
  });

  it('sets the initial tab from the URL hash', async () => {
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });
    window.location.hash = '#/sleep';
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    render(<App />);
    expect(await screen.findByText('Sleep Panel')).toBeInTheDocument();
  });

  it('calculates sleep data correctly', async () => {
    const sleepItems = [
      { hours: 8, quality: 'excellent' },
      { hours: 6, quality: 'good' },
      { hours: 7, quality: 'fair' },
    ];
    (useSleep as vi.Mock).mockReturnValue({
      items: sleepItems,
      loading: false,
    });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });

    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    render(<App />);

    await screen.findByText('WellGenie Dashboard');

    const avgSleep = ((8 + 6 + 7) / 3).toFixed(1);
    expect(screen.getByText(avgSleep)).toBeInTheDocument();
  });

  it('calculates diet data correctly', async () => {
    const dietItems = [
      { protein_g: 20, carbs_g: 50, fat_g: 10, calories: 370 },
      { protein_g: 25, carbs_g: 55, fat_g: 15, calories: 455 },
    ];
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: dietItems, loading: false });
    (useExercise as vi.Mock).mockReturnValue({ items: [], loading: false });

    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    render(<App />);

    await screen.findByText('WellGenie Dashboard');

    const avgCals = Math.round((370 + 455) / 2);
    expect(screen.getByText(avgCals.toString())).toBeInTheDocument();
  });

  it('calculates exercise data correctly', async () => {
    const exerciseItems = [
      { minutes: 30 },
      { duration_min: 45 },
      { duration: 60 },
    ];
    (useSleep as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useDiet as vi.Mock).mockReturnValue({ items: [], loading: false });
    (useExercise as vi.Mock).mockReturnValue({
      items: exerciseItems,
      loading: false,
    });
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: { username: 'testuser' },
    });
    render(<App />);

    await screen.findByText('WellGenie Dashboard');

    expect(screen.getByText('60')).toBeInTheDocument();
  });
});
