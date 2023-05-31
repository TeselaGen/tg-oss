import { render } from '@testing-library/react';
import Zoink from './zoink';
describe('Zoink', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Zoink />);
    expect(baseElement).toBeTruthy();
  });
});
