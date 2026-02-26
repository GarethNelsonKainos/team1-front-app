Feature: Protected routes

  Scenario: Unauthenticated user is redirected to Login when trying to view job-roles
    Given I am not logged in
    When I go to "/job-roles"
    Then I should be redirected to "/login"

  Scenario: Unauthenticated basic user is redirected to Login when trying to view add-roles
    Given I am not logged in
    When I go to "/add-role"
    Then I should be redirected to "/login"

  Scenario: Admin can access add-role
    Given I am logged in as an admin
    When I go to "/add-role"
    Then I should see the add role page

  Scenario: Applicant cannot access add-role
    Given I am logged in as an applicant
    When I go to "/add-role"
    Then I should be given an error
