describe('Test that we can create a new user', () => {
  it('passes if we can register a new user and login', () => {
    // launch the webapp
    cy.visit('http://localhost:3000');

    // Make sure we're on the sign in page
    cy.get('h1').should('have.text', 'Login Here !');
    cy.get('.Btn').first().should('have.text', 'Sign Up');
    cy.get('.Btn').last().should('have.text', 'Log In');

    // Enter in new user info
    const newUser = {
      username: 'endToEnd',
      password: 'sup3rs3cr3t',
      fullname: 'endToEnd Tester',
      email: 'e2e@test.com',
    };

    // Login new user
    cy.get('#firstName').type(`${newUser.username}`);
    cy.get('#password').type(`${newUser.password}`);
    cy.get('.submit-button').contains('Login').click();

    // Find comment button
    cy.get('button.comment-png').first().click();

    // Write comment
    cy.get('.comment-textarea').type('End to end testing comment');
    cy.get('.comment-container button.link-to-edit-post').contains('add comment').click();

    // Find newly written comment
    cy.get('.Comment-Text p').contains('End to end testing comment').should('be.visible');
    cy.get('.Comment-Header p').contains('endToEnd').should('be.visible');

    // Logout
    cy.get('.Btn').contains('Logout').click();
    cy.get('.logOutBtn').click();
  });
});
