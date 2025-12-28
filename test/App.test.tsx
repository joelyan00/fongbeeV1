import { render, screen } from '@testing-library/react';
import App from '../App';
import { describe, it, expect } from 'vitest';

describe('Simple Math', () => {
    it('adds 1 + 1', () => {
        expect(1 + 1).toBe(2);
    });
});

describe('App Component', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Check for some static text. 
        // "多伦多" is the default location state in App.tsx
        expect(screen.getByText('多伦多')).toBeInTheDocument();
    });
});
