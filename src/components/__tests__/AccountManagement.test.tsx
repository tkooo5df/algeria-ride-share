import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import AccountManagement from '../AccountManagement';

// Mock the useLocalAuth hook
jest.mock('@/hooks/useLocalAuth', () => ({
  useLocalAuth: jest.fn()
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

describe('AccountManagement', () => {
  const mockSwitchAccount = jest.fn();
  const mockUser = {
    email: 'test@example.com',
    role: 'passenger'
  };
  const mockAccounts = [
    { id: '1', email: 'test@example.com', password: 'password123', role: 'passenger' },
    { id: '2', email: 'driver@example.com', password: 'password123', role: 'driver' },
    { id: '3', email: 'admin@example.com', password: 'password123', role: 'admin' }
  ];

  beforeEach(() => {
    (useLocalAuth as jest.Mock).mockReturnValue({
      accounts: mockAccounts,
      switchAccount: mockSwitchAccount,
      user: mockUser
    });
  });

  it('renders account list correctly', () => {
    render(<AccountManagement />);
    
    expect(screen.getByText('إدارة الحسابات')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('driver@example.com')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  });

  it('shows current account indicator', () => {
    render(<AccountManagement />);
    
    const currentUserElement = screen.getByText('(الحساب الحالي)');
    expect(currentUserElement).toBeInTheDocument();
  });

  it('renders role-specific icons', () => {
    render(<AccountManagement />);
    
    // Check that role icons are rendered
    const userIcons = screen.getAllByRole('img');
    expect(userIcons.length).toBeGreaterThan(0);
  });
});