import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import emailjs from '@emailjs/browser';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  Unsubscribe,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  setDoc,
  getDoc,
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  collectionGroup,
} from 'firebase/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Router } from '@angular/router';
import { ViewServices } from './view-services';

@Injectable({
  providedIn: 'root',
})
export class Servers implements OnDestroy {
  private app = initializeApp(environment.firebaseConfig);
  public db = getFirestore(this.app);
  private auth = getAuth(this.app);
  private unsubscribeList: Unsubscribe | null = null;
  private router = inject(Router);
  private viewSrv = inject(ViewServices);


  allServersData = signal<any[]>([]);
  authService = signal<User | null>(null);

  constructor() {
    this.listenToAuthChanges();
  }

  private listenToAuthChanges() {
  onAuthStateChanged(this.auth, async (dbUser) => {
    if (dbUser) {
      const userData = doc(this.db, `users/${dbUser.uid}`);
      const userSnap = await getDoc(userData);

      if (userSnap.exists()) {
        const profile = userSnap.data() as User;
        this.authService.set(profile);

        if (profile.role === 0 || profile.role === 1) {
          this.listenToAllServersAdmin();
        } else {
          const distId = profile.distribuidoraAsignada || profile.distribuidoraObjetivo;
          this.listenToServersRealTime(distId);
        }
      }
    } else {
      this.authService.set(null);
    }
  });
}

private listenToAllServersAdmin() {
  if (this.unsubscribeList) this.unsubscribeList();

  const q = query(collectionGroup(this.db, 'servidores'));

  this.unsubscribeList = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const data = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
      id: doc.id,
      ...doc.data(),
    }));
    this.allServersData.set(data);
  });
}

  private listenToServersRealTime(distribuidoraId: string) {
    if (this.unsubscribeList) this.unsubscribeList();

    if (!distribuidoraId) return;

    const path = `distribuidoras/${distribuidoraId}/servidores`;
    const q = query(collection(this.db, path));

    this.unsubscribeList = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.allServersData.set(data);
    });
  }

  processedServers = computed(() => {
    const allData = this.allServersData();
    const user = this.authService();

    if (!user || !user.approved) return [];

    const filteredData = allData.filter((server) => {

      if (user.role === 0 || user.role === 1) {
        return true;
      }

      const isSameDist =
        server.nombreDistribuidora === user.distribuidoraAsignada;
      const isAllowedBranch = (user.sucursales || []).includes(
        server.nombreServidor
      );

      return isSameDist && isAllowedBranch;
    });

    return filteredData.map((server) => {
      const recommendedIds = server.recommendedIds || [];
      const mappedServices = (server.services || []).map((s: any) => {
        const isRecommended =
          s.recommended === true || recommendedIds.includes(s.id || s.name);
        return {
          ...s,
          id: s.id,
          service: s.name,
          exists: true,
          isRecommended: isRecommended,
          status: s.status,
        };
      });

      return {
        ...server,
        serviciosRecomendados: mappedServices.filter(
          (s: any) => s.isRecommended
        ),
        serviciosGeneral: mappedServices.filter((s: any) => !s.isRecommended),
        allServices: mappedServices,
      };
    });
  });

  async selectRecommended(
    distribuidoraId: string,
    serverId: string,
    serviceId: string,
    isRecommended: boolean
  ) {
    const path = `distribuidoras/${distribuidoraId}/servidores/${serverId}`;
    const serverDoc = doc(this.db, path);

    try {
      await updateDoc(serverDoc, {
        recommendedIds: isRecommended
          ? arrayRemove(serviceId)
          : arrayUnion(serviceId),
      });
    } catch (error) {
      console.error('Error actualizando recomendados:', error);
    }
  }

  async singIn(user: User) {
    const credential = await signInWithEmailAndPassword(getAuth(), user.email, user.password);
    const userId = credential.user.uid;

    const userDoc = await getDoc(doc(getFirestore(), 'users', userId));

    if(userDoc.exists()){
      const userData = {user: userDoc.data() as User}
      if(userData.user.approved){
        this.viewSrv.toastPresent(`Bienvenido ${userData.user.name.toUpperCase()}`, 'success');
        this.viewSrv.isLogin.set(true);
        this.router.navigateByUrl('/content');
      }else{
        this.router.navigateByUrl('/aprobation');
      }
    } else {
      this.viewSrv.toastPresent('Verifique usuario o contraseña', 'danger');
    }
  }

  async signOut() {
    return getAuth().signOut().then(() => {
      this.viewSrv.isLogin.set(false)
      this.router.navigateByUrl('/login');
    })
  }

  async register(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  async createUser(user: User, uid: string) {
    const userDoc = doc(getFirestore(), `users/${uid}`);

    const userProfile: User = {
      uid: uid,
      email: user.email,
      password: '',
      name: user.name,
      role: 2,
      approved: false,
      distribuidoraAsignada: '',
      distribuidoraObjetivo: user.distribuidoraObjetivo,
      sucursales: [],
    };

    await this.emailSender(user, uid);

    return setDoc(userDoc, userProfile);
  }

  async emailSender(user: User, userId: string) {
    const SERVICE_ID = environment.emailSender.serviceId;
    const TEMPLATE_ID = environment.emailSender.templateId;
    const PUBLIC_KEY = environment.emailSender.publicKey;

    const templateParams = {
      nombre: user.name,
      email: user.email,
      uid: userId,
      fecha: new Date().toLocaleString(),
      message: 'Nuevo usuario: Solicitud pendiente de aprobacion.',
      distribuidora: user.distribuidoraObjetivo,
    };

    try {
      const res = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      console.log('Email enviado con exito', res.status, res.text);
    } catch (error) {
      console.error('Error en el envio de correo', error);
      throw error;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeList) {
      this.unsubscribeList();
    }
  }
}
