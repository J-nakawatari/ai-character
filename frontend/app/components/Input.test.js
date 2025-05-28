import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input, { Textarea } from './Input';

describe('Input', () => {
  it('renders input with default props', () => {
    render(<Input id="test-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('input');
  });

  it('renders input with label', () => {
    render(<Input id="test-input" label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    render(<Input id="test-input" placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
  });

  it('renders input with custom type', () => {
    render(<Input id="test-input" type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders input with error message', () => {
    render(<Input id="test-input" error="This is an error" />);
    expect(screen.getByText('This is an error')).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--error');
  });

  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Input id="test-input" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders input with custom size', () => {
    render(<Input id="test-input" size="sm" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input--sm');
  });

  it('renders input with custom className', () => {
    render(<Input id="test-input" className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });
});

describe('Textarea', () => {
  it('renders textarea with default props', () => {
    render(<Textarea id="test-textarea" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveClass('input', 'textarea');
  });

  it('renders textarea with label', () => {
    render(<Textarea id="test-textarea" label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders textarea with placeholder', () => {
    render(<Textarea id="test-textarea" placeholder="Enter text" />);
    const textarea = screen.getByPlaceholderText('Enter text');
    expect(textarea).toBeInTheDocument();
  });

  it('renders textarea with error message', () => {
    render(<Textarea id="test-textarea" error="This is an error" />);
    expect(screen.getByText('This is an error')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('input--error');
  });

  it('handles change events', () => {
    const handleChange = jest.fn();
    render(<Textarea id="test-textarea" onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders textarea with custom rows', () => {
    render(<Textarea id="test-textarea" rows={6} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '6');
  });

  it('renders textarea with custom className', () => {
    render(<Textarea id="test-textarea" className="custom-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-class');
  });
}); 