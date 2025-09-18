// Google OAuth Service
class GoogleAuthService {
  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.gapi = null;
    this.isInitialized = false;
  }

  // Initialize Google API
  async init() {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google API script
      if (!window.gapi) {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          this.loadAuth2().then(resolve).catch(reject);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      } else {
        this.loadAuth2().then(resolve).catch(reject);
      }
    });
  }

  async loadAuth2() {
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2', {
        callback: () => {
          window.gapi.auth2.init({
            client_id: this.clientId,
            scope: 'profile email'
          }).then(() => {
            this.isInitialized = true;
            resolve();
          }).catch(reject);
        },
        onerror: reject
      });
    });
  }

  // Sign in with Google
  async signIn() {
    try {
      await this.init();
      const authInstance = window.gapi.auth2.getAuthInstance();
      const googleUser = await authInstance.signIn();
      
      const profile = googleUser.getBasicProfile();
      const idToken = googleUser.getAuthResponse().id_token;
      
      return {
        success: true,
        user: {
          id: profile.getId(),
          name: profile.getName(),
          email: profile.getEmail(),
          imageUrl: profile.getImageUrl(),
          idToken: idToken
        }
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return {
        success: false,
        error: error.error || 'Google sign-in failed'
      };
    }
  }

  // Sign out
  async signOut() {
    try {
      if (this.isInitialized) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signOut();
      }
      return { success: true };
    } catch (error) {
      console.error('Google sign-out error:', error);
      return { success: false, error: 'Sign-out failed' };
    }
  }

  // Check if user is signed in
  isSignedIn() {
    if (!this.isInitialized) return false;
    const authInstance = window.gapi.auth2.getAuthInstance();
    return authInstance.isSignedIn.get();
  }
}

export default new GoogleAuthService();