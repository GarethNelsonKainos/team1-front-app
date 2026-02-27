Feature: check job role details page
    As an applicant
    I want to view the details of a job role
    So that I can decide if I want to apply for it
    
    Scenario: Applicant views job role details, then clicks to go back to job roles list
        Given I am logged in as an applicant
        When I navigate to the "Low Code Principal Architect" role
        Then I should see the job role details page for "Low Code Principal Architect"
        When I click the Back to Job Roles button
        Then I should be taken back to the "/job-roles" page