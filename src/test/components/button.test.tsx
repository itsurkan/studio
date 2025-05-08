import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render', () => {
    render(<Button>Test Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /Test Button/i });
    expect(buttonElement).toBeTruthy();
  });
});