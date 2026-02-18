import { createJobRoleSchema } from '../utils/validators.js';

document.addEventListener('DOMContentLoaded', async () => {
    // TODO: Add authorization check here when auth module is ready
    // Check if user is Admin before allowing access to this page
    
    await loadDropdownData();
    setupFormValidation();
    setupFormSubmission();
});

// Load bands, capabilities, and locations from backend
async function loadDropdownData() {
    const token = sessionStorage.getItem('authToken');
    
    // TODO: Add proper auth check when auth module is ready
    if (!token) {
        window.location.href = '/login';
        return;
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        // Load capabilities
        const capabilitiesResponse = await fetch(`${API_BASE_URL}/api/capabilities`, { headers });
        const capabilities = await capabilitiesResponse.json();
        populateDropdown('capability', capabilities, 'capabilityId', 'capabilityName');

        // Load bands
        const bandsResponse = await fetch(`${API_BASE_URL}/api/bands`, { headers });
        const bands = await bandsResponse.json();
        populateDropdown('band', bands, 'bandId', 'bandName');

        // Load locations
        const locationsResponse = await fetch(`${API_BASE_URL}/api/locations`, { headers });
        const locations = await locationsResponse.json();
        populateLocationSelect('location', locations);

    } catch (error) {
        console.error('Error loading dropdown data:', error);
        showFormMessage('Failed to load form data. Please refresh the page.', 'error');
    }
}

function populateDropdown(selectId, items, valueKey, textKey) {
    const select = document.getElementById(selectId);
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey];
        option.textContent = item[textKey];
        select.appendChild(option);
    });
}

function populateLocationSelect(selectId, locations) {
    const select = document.getElementById(selectId);
    select.innerHTML = ''; // Clear loading message
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.locationId;
        option.textContent = `${location.locationName} (${location.city}, ${location.country})`;
        select.appendChild(option);
    });
}

function setupFormValidation() {
    const form = document.getElementById('addJobRoleForm');
    
    // Role name validation (3-100 chars)
    const roleName = document.getElementById('roleName');
    roleName.addEventListener('blur', () => {
        validateField(roleName, 'roleNameError', (value) => {
            if (value.length < 3) return 'Role name must be at least 3 characters';
            if (value.length > 100) return 'Role name cannot exceed 100 characters';
            return null;
        });
    });

    // Job spec summary validation (10-500 chars)
    const summary = document.getElementById('jobSpecSummary');
    const summaryCount = document.getElementById('summaryCount');
    summary.addEventListener('input', () => {
        summaryCount.textContent = `${summary.value.length}/500`;
        validateField(summary, 'jobSpecSummaryError', (value) => {
            if (value.length < 10) return 'Summary must be at least 10 characters';
            if (value.length > 500) return 'Summary cannot exceed 500 characters';
            return null;
        });
    });

    // SharePoint link validation
    const jobSpecLink = document.getElementById('jobSpecLink');
    jobSpecLink.addEventListener('blur', () => {
        validateField(jobSpecLink, 'jobSpecLinkError', (value) => {
            if (!value.startsWith('https://kainossoftwareltd.sharepoint.com')) {
                return 'Must be a valid Kainos SharePoint link';
            }
            return null;
        });
    });

    // Responsibilities validation (10-1000 chars)
    const responsibilities = document.getElementById('responsibilities');
    const responsibilitiesCount = document.getElementById('responsibilitiesCount');
    responsibilities.addEventListener('input', () => {
        responsibilitiesCount.textContent = `${responsibilities.value.length}/1000`;
        validateField(responsibilities, 'responsibilitiesError', (value) => {
            if (value.length < 10) return 'Responsibilities must be at least 10 characters';
            if (value.length > 1000) return 'Responsibilities cannot exceed 1000 characters';
            return null;
        });
    });

    // Open positions validation (1-100)
    const openPositions = document.getElementById('openPositions');
    openPositions.addEventListener('blur', () => {
        validateField(openPositions, 'openPositionsError', (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num < 1) return 'Must have at least 1 open position';
            if (num > 100) return 'Cannot exceed 100 open positions';
            return null;
        });
    });

    // Closing date validation (must be in future)
    const closingDate = document.getElementById('closingDate');
    closingDate.addEventListener('blur', () => {
        validateField(closingDate, 'closingDateError', (value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate <= today) {
                return 'Closing date must be in the future';
            }
            return null;
        });
    });

    // Location validation (at least one selected)
    const location = document.getElementById('location');
    location.addEventListener('change', () => {
        validateField(location, 'locationError', () => {
            if (location.selectedOptions.length === 0) {
                return 'Please select at least one location';
            }
            return null;
        });
    });
}

function validateField(field, errorId, validationFn) {
    const errorElement = document.getElementById(errorId);
    const error = validationFn(field.value);
    
    if (error) {
        errorElement.textContent = error;
        errorElement.classList.remove('hidden');
        field.classList.add('border-red-500');
        return false;
    } else {
        errorElement.classList.add('hidden');
        field.classList.remove('border-red-500');
        return true;
    }
}

function setupFormSubmission() {
    const form = document.getElementById('addJobRoleForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        const isValid = validateAllFields();
        if (!isValid) {
            showFormMessage('Please fix all validation errors before submitting.', 'error');
            return;
        }

        // Get selected locations
        const locationSelect = document.getElementById('location');
        const locationIds = Array.from(locationSelect.selectedOptions).map(opt => parseInt(opt.value));

        // Prepare data according to backend schema
        const formData = {
            roleName: document.getElementById('roleName').value.trim(),
            capabilityId: parseInt(document.getElementById('capability').value),
            bandId: parseInt(document.getElementById('band').value),
            description: document.getElementById('jobSpecSummary').value.trim(),
            responsibilities: document.getElementById('responsibilities').value.trim(),
            jobSpecLink: document.getElementById('jobSpecLink').value.trim(),
            openPositions: parseInt(document.getElementById('openPositions').value),
            locationIds: locationIds,
            closingDate: new Date(document.getElementById('closingDate').value).toISOString()
        };

        try {
            const token = sessionStorage.getItem('authToken');
            
            // TODO: Add authorization check when auth module is ready
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/job-roles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                showFormMessage('Job role created successfully! Redirecting...', 'success');
                
                // Redirect to job roles list after 2 seconds
                setTimeout(() => {
                    window.location.href = '/job-roles';
                }, 2000);
            } else {
                const error = await response.json();
                showFormMessage(error.error || 'Failed to create job role. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showFormMessage('Network error. Please check your connection and try again.', 'error');
        }
    });
}

function validateAllFields() {
    let isValid = true;

    // Validate required fields
    const roleName = document.getElementById('roleName');
    isValid = validateField(roleName, 'roleNameError', (value) => {
        if (!value || value.length < 3) return 'Role name must be at least 3 characters';
        return null;
    }) && isValid;

    const capability = document.getElementById('capability');
    isValid = validateField(capability, 'capabilityError', (value) => {
        if (!value) return 'Please select a capability';
        return null;
    }) && isValid;

    const band = document.getElementById('band');
    isValid = validateField(band, 'bandError', (value) => {
        if (!value) return 'Please select a band';
        return null;
    }) && isValid;

    const summary = document.getElementById('jobSpecSummary');
    isValid = validateField(summary, 'jobSpecSummaryError', (value) => {
        if (value.length < 10) return 'Summary must be at least 10 characters';
        return null;
    }) && isValid;

    const jobSpecLink = document.getElementById('jobSpecLink');
    isValid = validateField(jobSpecLink, 'jobSpecLinkError', (value) => {
        if (!value.startsWith('https://kainossoftwareltd.sharepoint.com')) {
            return 'Must be a valid Kainos SharePoint link';
        }
        return null;
    }) && isValid;

    const responsibilities = document.getElementById('responsibilities');
    isValid = validateField(responsibilities, 'responsibilitiesError', (value) => {
        if (value.length < 10) return 'Responsibilities must be at least 10 characters';
        return null;
    }) && isValid;

    const openPositions = document.getElementById('openPositions');
    isValid = validateField(openPositions, 'openPositionsError', (value) => {
        const num = parseInt(value);
        if (isNaN(num) || num < 1) return 'Must have at least 1 open position';
        return null;
    }) && isValid;

    const location = document.getElementById('location');
    isValid = validateField(location, 'locationError', () => {
        if (location.selectedOptions.length === 0) {
            return 'Please select at least one location';
        }
        return null;
    }) && isValid;

    const closingDate = document.getElementById('closingDate');
    isValid = validateField(closingDate, 'closingDateError', (value) => {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            return 'Closing date must be in the future';
        }
        return null;
    }) && isValid;

    return isValid;
}

function showFormMessage(message, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = message;
    messageDiv.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
    
    if (type === 'error') {
        messageDiv.classList.add('bg-red-100', 'text-red-700');
    } else {
        messageDiv.classList.add('bg-green-100', 'text-green-700');
    }
}