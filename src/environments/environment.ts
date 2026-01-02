// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  firebaseConfig: {
    apiKey: 'AIzaSyByNesfULmznQP3mJCJb2PcNcWlLjGRY_w',
    authDomain: 'soporteti-bo.firebaseapp.com',
    projectId: 'soporteti-bo',
    storageBucket: 'soporteti-bo.firebasestorage.app',
    messagingSenderId: '420573400400',
    appId: '1:420573400400:web:4c22401694b3d86bc83055',
    measurementId: 'G-EPJ041PJSB',
  },

  userProfile: {
    admin: 0,
    support: 1,
    user: 2
  },

  emailSender: {
    serviceId: 'service_rfocvud',
    templateId: 'template_plqabbk',
    publicKey: 'jNHr-ZZsIniEi9zbB'
  }

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
