Feature: Add New Job Role
  As an admin user
  I want to add new job roles
  So that hiring managers can recruit for open positions

  Background:
    Given I am logged in as an admin
    And I am on the add job role page

  Scenario: Admin successfully creates a new job role
    Given I have filled in all required fields with valid data
    When I submit the form
    Then I should be redirected to the job roles list page
    And the new job role should be visible in the list