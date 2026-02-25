Feature: Apply for a job role
  As an applicant
  I want to apply for a job role
  So that I can be considered for the position

  Scenario: Applicant successfully applies for a role
    Given I am logged in as an applicant
    When I navigate to the "Low Code Principal Architect" role
    And I click Apply Now
    And I upload my CV
    And I submit the application
    Then I should see the application success page
