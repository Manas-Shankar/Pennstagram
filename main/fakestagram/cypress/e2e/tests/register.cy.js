describe('Test that we can create a new user', () => {
  it('passes if we can register a new user and login', () => {
    // launch the webapp
    cy.visit('http://localhost:3000');

    // Make sure we're on the sign in page
    cy.get('h1').should('have.text', 'Login Here !');
    cy.get('.Btn').first().should('have.text', 'Sign Up');
    cy.get('.Btn').last().should('have.text', 'Log In');

    // Navigate to Sign Up
    cy.get('.submit-button').contains('Sign Up').click();

    // Enter in new user info
    const newUser = {
      username: 'endToEnd',
      password: 'sup3rs3cr3t',
      fullname: 'endToEnd Tester',
      email: 'e2e@test.com',
    };

    cy.get('.username input').type(`${newUser.username}`);
    cy.get('#password').type(`${newUser.password}`);
    cy.get('#fullName').type(`${newUser.fullname}`);
    cy.get('#email').type(`${newUser.email}`);

    // Submit new user registration
    cy.get('.submit-button').contains('Sign Up').click();

    // Login new user
    cy.get('#firstName').type(`${newUser.username}`);
    cy.get('#password').type(`${newUser.password}`);
    cy.get('.submit-button').contains('Login').click();

    // Logout
    cy.get('.Btn').contains('Logout').click();
    cy.get('.logOutBtn').click();
  });
});
