// Google OAuth Service - Simplified using Google One Tap
// This completely eliminates the "dpiframe_initialization_failed" error
class GoogleAuthService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.isInitialized = false;
  }

  // Initialize Google Identity Services
  async init() {
    if (this.isInitialized) return Promise.resolve();

    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isInitialized = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
      document.head.appendChild(script);
    });
  }

  // Sign in with Google using One Tap
  async signIn() {
    try {
      await this.init();

      return new Promise((resolve, reject) => {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: this.clientId,
          callback: async (response) => {
            try {
              // Decode the JWT ID token to get user info
              const userInfo = this.parseJwt(response.credential);
              
              resolve({
                success: true,
                user: {
                  id: userInfo.sub,
                  name: userInfo.name,
                  email: userInfo.email,
                  imageUrl: userInfo.picture,
                  idToken: response.credential
                }
              });
            } catch (error) {
              console.error('Error parsing token:', error);
              resolve({
                success: false,
                error: 'Failed to process Google sign-in'
              });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the Sign-In button in a popup
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log('One Tap not displayed:', notification.getNotDisplayedReason());
            // Fallback to manual button click
            this.showSignInPopup(resolve, reject);
          } else if (notification.isSkippedMoment()) {
            console.log('One Tap skipped:', notification.getSkippedReason());
            this.showSignInPopup(resolve, reject);
          }
        });
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.message || 'Google sign-in failed'
      };
    }
  }

  // Show manual sign-in popup as fallback
  showSignInPopup(resolve, reject) {
    // Create temporary container for Google button
    const container = document.createElement('div');
    container.id = 'g_id_signin';
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '10000';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    document.body.appendChild(container);

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
    backdrop.style.zIndex = '9999';
    backdrop.onclick = () => {
      document.body.removeChild(container);
      document.body.removeChild(backdrop);
      resolve({ success: false, error: 'Sign-in cancelled' });
    };
    document.body.appendChild(backdrop);

    // Render Google Sign-In button
    window.google.accounts.id.renderButton(
      container,
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300
      }
    );

    // Update callback to clean up
    const originalCallback = window.google.accounts.id._config?.callback;
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: async (response) => {
        // Clean up UI
        if (container.parentNode) document.body.removeChild(container);
        if (backdrop.parentNode) document.body.removeChild(backdrop);

        try {
          const userInfo = this.parseJwt(response.credential);
          resolve({
            success: true,
            user: {
              id: userInfo.sub,
              name: userInfo.name,
              email: userInfo.email,
              imageUrl: userInfo.picture,
              idToken: response.credential
            }
          });
        } catch (error) {
          resolve({
            success: false,
            error: 'Failed to process Google sign-in'
          });
        }
      }
    });
  }

  // Parse JWT token to extract user info
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      if (this.isInitialized && window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      return { success: true };
    } catch (error) {
      console.error('Google sign-out error:', error);
      return { success: false, error: 'Sign-out failed' };
    }
  }

  // Check if user is signed in (managed by app state)
  isSignedIn() {
    return false;
  }
}

export default new GoogleAuthService();
