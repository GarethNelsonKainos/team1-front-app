Feature: View Job Role Specification
  As an applicant
  I want to view detailed information about job roles
  So I can make informed decisions about applying

  Scenario: Display complete job role details with all information
    Given I am currently logged in as an applicant
    When I view the first job role
    Then I should see the job role heading
    And I should see the location
    And I should see the capability
    And I should see the band
    And I should see the closing date in DD/MM/YYYY format
    And I should see the open positions

  Scenario: Show apply button for open roles with available positions
    Given I am logged in with user permissions of an applicant
    When I view the first job role
    Then I should see the apply button
    And the apply button should be enabled

  Scenario: Disable apply button when no positions available
    Given I am now logged in as an applicant
    When I view the first job role
    And there are no open positions
    Then the apply button should be disabled

  Scenario: Show error when job role not found
    Given I am presently logged in as an applicant
    When I navigate to a non-existent job role
    Then I should see an error message