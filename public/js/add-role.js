// Character counters
const descriptionTextarea = document.getElementById('description');
const responsibilitiesTextarea = document.getElementById('responsibilities');
const summaryCount = document.getElementById('summaryCount');
const responsibilitiesCount = document.getElementById('responsibilitiesCount');

if (descriptionTextarea && summaryCount) {
    descriptionTextarea.addEventListener('input', function(e) {
        summaryCount.textContent = `${e.target.value.length}/500`;
    });
}

if (responsibilitiesTextarea && responsibilitiesCount) {
    responsibilitiesTextarea.addEventListener('input', function(e) {
        responsibilitiesCount.textContent = `${e.target.value.length}/1000`;
    });
}

// Clear validation errors when user changes input
const clearError = (fieldId) => {
    const errorElement = document.getElementById(`${fieldId}Error`);
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
};

// Add event listeners to clear errors on change
document.getElementById('roleName')?.addEventListener('input', () => clearError('roleName'));
document.getElementById('capability')?.addEventListener('change', () => clearError('capability'));
document.getElementById('band')?.addEventListener('change', () => clearError('band'));
document.getElementById('description')?.addEventListener('input', () => clearError('description'));
document.getElementById('responsibilities')?.addEventListener('input', () => clearError('responsibilities'));
document.getElementById('jobSpecLink')?.addEventListener('input', () => clearError('jobSpecLink'));
document.getElementById('openPositions')?.addEventListener('input', () => clearError('openPositions'));
document.getElementById('location')?.addEventListener('change', () => clearError('location'));
document.getElementById('closingDate')?.addEventListener('change', () => clearError('closingDate'));

// Helper function to show error
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

// Client-side validation before form submit
const addJobRoleForm = document.getElementById('addJobRoleForm');
if (addJobRoleForm) {
    addJobRoleForm.addEventListener('submit', (e) => {
        // Clear previous errors
        document.querySelectorAll('.error-message').forEach(el => el.classList.add('hidden'));
        
        let isValid = true;
        
        // Validate role name - minimum 3 characters, max 100
        const roleName = document.getElementById('roleName').value.trim();
        if (!roleName) {
            showError('roleName', 'Job role name is required');
            isValid = false;
        } else if (roleName.length < 3) {
            showError('roleName', 'Role name must be at least 3 characters');
            isValid = false;
        } else if (roleName.length > 100) {
            showError('roleName', 'Role name cannot exceed 100 characters');
            isValid = false;
        }
        
        // Validate capability
        const capability = document.getElementById('capability').value;
        if (!capability) {
            showError('capability', 'Please select a capability');
            isValid = false;
        }
        
        // Validate band
        const band = document.getElementById('band').value;
        if (!band) {
            showError('band', 'Please select a band');
            isValid = false;
        }
        
        // Validate description - minimum 10 characters, max 500
        const description = document.getElementById('description').value.trim();
        if (!description) {
            showError('description', 'Job description is required');
            isValid = false;
        } else if (description.length < 10) {
            showError('description', 'Description must be at least 10 characters');
            isValid = false;
        } else if (description.length > 500) {
            showError('description', 'Description must be 500 characters or less');
            isValid = false;
        }
        
        // Validate responsibilities - minimum 10 characters, max 1000
        const responsibilities = document.getElementById('responsibilities').value.trim();
        if (!responsibilities) {
            showError('responsibilities', 'Responsibilities are required');
            isValid = false;
        } else if (responsibilities.length < 10) {
            showError('responsibilities', 'Responsibilities must be at least 10 characters');
            isValid = false;
        } else if (responsibilities.length > 1000) {
            showError('responsibilities', 'Responsibilities must be 1000 characters or less');
            isValid = false;
        }
        
        // Validate job spec link - must be Kainos SharePoint link
        const jobSpecLink = document.getElementById('jobSpecLink').value.trim();
        if (!jobSpecLink) {
            showError('jobSpecLink', 'SharePoint link is required');
            isValid = false;
        } else if (!jobSpecLink.startsWith('https://kainossoftwareltd.sharepoint.com')) {
            showError('jobSpecLink', 'Must be a Kainos SharePoint link (https://kainossoftwareltd.sharepoint.com)');
            isValid = false;
        }
        
        // Validate open positions
        const openPositions = parseInt(document.getElementById('openPositions').value, 10);
        if (isNaN(openPositions) || openPositions < 1) {
            showError('openPositions', 'At least 1 open position is required');
            isValid = false;
        } else if (openPositions > 100) {
            showError('openPositions', 'Cannot exceed 100 open positions');
            isValid = false;
        }
        
        // Validate locations
        const locationSelect = document.getElementById('location');
        if (!locationSelect || locationSelect.selectedOptions.length === 0) {
            showError('location', 'Please select at least one location');
            isValid = false;
        }
        
        // Validate closing date
        const closingDateValue = document.getElementById('closingDate').value;
        if (!closingDateValue) {
            showError('closingDate', 'Closing date is required');
            isValid = false;
        } else {
            const closingDate = new Date(closingDateValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (closingDate <= today) {
                showError('closingDate', 'Closing date must be in the future');
                isValid = false;
            }
        }
        
        // Prevent form submission if validation fails
        if (!isValid) {
            e.preventDefault();
        }
        // If valid, form submits normally via traditional POST
    });
}