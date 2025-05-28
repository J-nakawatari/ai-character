import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Toast from './Toast';

jest.useFakeTimers();

describe('Toast', () => {
  it('renders toast with success type', () => {
    render(<Toast show={true} message="Success message" type="success" />);
    
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders toast with error type', () => {
    render(<Toast show={true} message="Error message" type="error" />);
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('renders toast with info type', () => {
    render(<Toast show={true} message="Info message" type="info" />);
    
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('does not render when show is false', () => {
    render(<Toast show={false} message="Test message" />);
    
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('automatically hides after duration', () => {
    const onClose = jest.fn();
    render(<Toast show={true} message="Test message" duration={3000} onClose={onClose} />);
    
    // 初期表示の確認
    expect(screen.getByText('Test message')).toBeInTheDocument();
    
    // タイマーを進める
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    // フェードアウトアニメーション用の500msを待つ
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // コンポーネントが非表示になり、onCloseが呼ばれることを確認
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });

  it('cleans up timer on unmount', () => {
    const { unmount } = render(<Toast show={true} message="Test message" />);
    
    // タイマーを進める前にアンマウント
    unmount();
    
    // タイマーを進めてもエラーが発生しないことを確認
    act(() => {
      jest.advanceTimersByTime(3000);
    });
  });
}); 