import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { doc, getDoc } from '@angular/fire/firestore';
import { map, switchMap, of, catchError } from 'rxjs';
import { ViewServices } from './view-services';
import { Servers } from './servers';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const viewSrvc = inject(ViewServices);
  const servers = inject(Servers);

  return authState(auth).pipe(
    switchMap((user) => {
      if (!user) {
        router.navigate(['/login']);
        return of(false);
      }

      const getUser = servers.getUser(user.uid);

      return getUser;
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
