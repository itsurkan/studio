import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

it('should render the Alert component with correct content', () => {
  render(
    <Alert>
      <AlertTitle>Test Title</AlertTitle>
      <AlertDescription>Test Description</AlertDescription>
    </Alert>
  );
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('Test Description')).toBeInTheDocument();
});