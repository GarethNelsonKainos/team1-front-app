<script>
    document.addEventListener('DOMContentLoaded', function() {
        // TODO: Replace with proper auth check when auth module is ready
        // For now, check if user token exists and has admin role
        const token = sessionStorage.getItem('authToken');
        
        if (token) {
            try {
                // Decode JWT token to check user role
                const payload = JSON.parse(atob(token.split('.')[1]));
                
                // UserRole.Admin = 2 (from backend auth.types.ts)
                if (payload.userRole === 2) {
                    document.getElementById('adminActions').classList.remove('hidden');
                }
            } catch (error) {
                console.error('Error checking user role:', error);
            }
        }
    });
</script>