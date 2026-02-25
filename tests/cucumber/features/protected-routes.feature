Feature: Protected routes

  Scenario: Unauthenticated user is redirected from job roles
    Given I am not logged in
    When I navigate to "/job-roles"
    Then I should be redirected to "/login"

  Scenario: Unauthenticated user is redirected from add role
    Given I am not logged in
    When I navigate to "/add-role"
    Then I should be redirected to "/login"
