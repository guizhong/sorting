import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';
import type { DataCard } from '../game/types';

const faceDownCard: DataCard = {
  id: 'E',
  value: 556,
  faceUp: false,
};

const faceUpCard: DataCard = {
  id: 'E',
  value: 556,
  faceUp: true,
};

describe('Card', () => {
  describe('value leakage prevention', () => {
    it('does not render value in DOM when face down', () => {
      render(
        <Card
          card={faceDownCard}
          isSelected={false}
          isInPile={false}
        />,
      );
      // The value 556 must NOT appear in the DOM
      expect(screen.queryByText('556')).toBeNull();
    });

    it('does render value in DOM when face up', () => {
      render(
        <Card
          card={faceUpCard}
          isSelected={false}
          isInPile={false}
        />,
      );
      expect(screen.getByText('556')).toBeTruthy();
    });

    it('does not leak value in data attributes when face down', () => {
      const { container } = render(
        <Card
          card={faceDownCard}
          isSelected={false}
          isInPile={false}
        />,
      );
      const element = container.firstElementChild!;
      expect(element.getAttribute('data-value')).toBeNull();
    });

    it('shows only the letter on face-down cards', () => {
      render(
        <Card
          card={faceDownCard}
          isSelected={false}
          isInPile={false}
        />,
      );
      expect(screen.getByText('E')).toBeTruthy();
    });

    it('shows letter and value on face-up cards', () => {
      render(
        <Card
          card={faceUpCard}
          isSelected={false}
          isInPile={false}
        />,
      );
      expect(screen.getByText('E')).toBeTruthy();
      expect(screen.getByText('556')).toBeTruthy();
    });
  });
});
