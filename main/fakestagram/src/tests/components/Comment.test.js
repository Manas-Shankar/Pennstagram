import React from 'react';
import { render } from '@testing-library/react';
import Comment from '../../components/Comment';

describe('Comment Component', () => {
  const mockData = {
    user_id: 'testUser',
    content: 'This is a test comment',
  };

  it('renders the comment with provided data', () => {
    const { getByText } = render(<Comment data={mockData} />);

    const usernameElement = getByText(mockData.user_id);
    const textElement = getByText(mockData.content);

    expect(usernameElement).toBeInTheDocument();
    expect(textElement).toBeInTheDocument();
  });

});