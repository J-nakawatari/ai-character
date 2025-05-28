import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

// next-intlのモック
jest.mock('next-intl', () => ({
  useTranslations: () => (key) => key
}));

// 多言語対応のためのProviderモック
const wrapper = ({ children }) => children;

describe('ErrorMessage', () => {
  it('renders inline error message', () => {
    render(<ErrorMessage message="This is an error" type="inline" />, { wrapper });
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('renders modal error message', () => {
    render(<ErrorMessage message="Modal error" type="modal" />, { wrapper });
    expect(screen.getByText('Modal error')).toBeInTheDocument();
  });
}); 