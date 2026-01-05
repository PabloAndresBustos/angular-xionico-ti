import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Biometric {
  private readonly CRED_ID_KEY = 'xionico_auth_cred_id';

  async isAvailalbe(): Promise<boolean> {
    return !!(
      window.PublicKeyCredential &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  }

  async registerBio(email: string): Promise<boolean> {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const credentials = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'Xionico BackOffice Ti' },
          user: {
            id: userId,
            name: email,
            displayName: email,
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: { userVerification: 'required' },
          timeout: 60000,
        },
      })) as PublicKeyCredential;

      localStorage.setItem(
        this.CRED_ID_KEY,
        btoa(String.fromCharCode(...new Uint8Array(credentials.rawId)))
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async verify(): Promise<boolean> {
    const saveId = localStorage.getItem(this.CRED_ID_KEY);
    if (!saveId) return false;

    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{
            id: Uint8Array.from(atob(saveId), c => c.charCodeAt(0)),
            type: 'public-key'
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });
      return true;
    } catch (error) {
      console.error('webAuthn error', error);
      return false;
    }
  }
}
