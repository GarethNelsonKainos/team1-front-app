Manual Testing Checklist

Test 1: Delete Link on Job Roles List Page
Steps:
1. Navigate to /job-roles (authenticated as admin)
2. Locate the "Delete" link in the Actions column
3. Click "Delete" link for a job role
4. Verify: Page redirects to /job-roles/{id}/confirm-delete
5. Verify: Confirm-delete page displays role name, location, capability, band, closing date
6. Verify: "Cancel" button returns to /job-roles list
7. Verify: "Confirm Delete" button submits POST to /job-roles/{id}/delete

Test 2: Delete Link on Job Role Detail Page
Steps:
1. Navigate to /job-roles/{id} (authenticated as admin)
2. Locate the "Delete role" link
3. Click "Delete role" link
4. Verify: Page redirects to /job-roles/{id}/confirm-delete
5. Verify: Same confirm-delete page displays with correct role data
6. Verify: Actions work as expected

Test 3: Confirm-Delete Page Content
Steps:
1. Navigate to /job-roles/{id}/confirm-delete (authenticated as admin)
2. Verify: Page title is "Confirm Delete"
3. Verify: Warning message appears in red box
4. Verify: Role Details section shows:
   - Role Name
   - Location
   - Capability
   - Band
   - Closing Date
5. Verify: Cancel and Confirm buttons are present

Test 4: Non-Authenticated User (No Token)
Steps:
1. Clear all cookies/tokens
2. Try to access /job-roles/{id}/confirm-delete directly
3. Verify: Redirected to /login
4. Verify: No error page shown

Test 5: Non-Admin User (Applicant Role)
Steps:
1. Login as applicant user (userRole: 'Applicant')
2. Navigate to /job-roles/{id}/confirm-delete
3. Verify: Page loads (authenticated)
4. Click "Confirm Delete" button
5. Verify: Error page displays with 403 status
6. Verify: Error message: "You do not have permission to delete job roles."
7. Verify: User stays on error page, not deleted

Test 6: Admin User Successful Delete
Steps:
1. Login as admin user (userRole: 'Admin')
2. Navigate to /job-roles list
3. Click "Delete" on a test role
4. Verify: Confirm-delete page renders
5. Click "Confirm Delete" button
6. Verify: 302 redirect to /job-roles
7. Verify: Role is no longer in the list
8. Verify: Backend database was updated (role deleted)

Test 7: No Client-Side JavaScript
Steps:
1. Disable JavaScript in browser developer tools
2. Repeat all above tests with JS disabled
3. Verify: Delete flow still works (all HTML forms, no fetch/AJAX)
4. Verify: Redirects work normally