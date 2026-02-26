Feature: Admin Only routes

    Scenario: Applicant is redirected from add role
        Given that I am signed in a standard user
        When I navigate to the "/job-roles" section
        Then I should not see the "Add Role" button

    Scenario: Applicant is redirected from add role
        Given that I am signed in a standard user
        When I navigate to the "/add-role" section
        Then I should see the "You do not have permission to access this page" message