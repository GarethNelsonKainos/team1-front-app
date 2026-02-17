document.addEventListener('DOMContentLoaded', function() {
  const deleteButtons = document.querySelectorAll('[data-delete-role]');
  const apiBaseUrl = document.body.dataset.apiBaseUrl;

  async function deleteRole(roleId, redirectTo = '/job-roles') {
    const confirmed = window.confirm('Are you sure you want to delete this role?');
    if (!confirmed) {
      return;
    }

    const token = sessionStorage.getItem('authToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${apiBaseUrl}/api/job-roles/${roleId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      window.location.href = redirectTo;
    } catch (error) {
      console.error('Error deleting job role:', error);
      window.alert('Unable to delete role. Please try again.');
    }
  }

  deleteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const roleId = this.getAttribute('data-role-id');
      const redirectTo = this.getAttribute('data-redirect-to') || '/job-roles';
      if (roleId) {
        deleteRole(roleId, redirectTo);
      }
    });
  });
});