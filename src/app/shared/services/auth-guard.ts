import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { map, switchMap, of, catchError } from 'rxjs';
import { ViewServices } from './view-services';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);
  const viewSrvc = inject(ViewServices);

  return authState(auth).pipe(
    switchMap((user) => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }

      return getDoc(doc(firestore, 'users', user.uid));
    }),
    map((docSnap) => {
      if (typeof docSnap === 'boolean') return docSnap;

      const userData = docSnap.data() as any;
      if (userData && userData.approved) {
        return true;
      } else if (userData && !userData.approved) {
        router.navigate(['/aprobation']);
        return false;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError((err) => {
      const msg = err.message || 'Error de conexión con la base de datos';
      viewSrvc.toastPresent(msg, 'danger');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
