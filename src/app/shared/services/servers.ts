import { Injectable, signal, computed, OnDestroy, inject } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import emailjs from '@emailjs/browser';
import { Router } from '@angular/router';
import { ViewServices } from './view-services';
import { Biometric } from './biometric';
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
  deleteDoc,
} from 'firebase/firestore';
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';

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
  private biometric = inject(Biometric);

  allServersData = signal<any[]>([]);
  authService = signal<User | null>(null);
  adminUser = signal<boolean>(false);
  supportUser = signal<boolean>(false);
  distribuidoras = signal<any[]>([]);
  allUsers = signal<User[]>([]);

  constructor() {
    this.listenToAuthChanges();
    this.listenToAllUsers();
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
            const distId =
              profile.distribuidoraAsignada || profile.distribuidoraObjetivo;
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

    this.unsubscribeList = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        this.allServersData.set(data);
      }
    );
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

  async getUser(userId:string){
    return await getDoc(doc(getFirestore(), 'users', userId));
  }

  async singIn(user: User) {
    const credential = await signInWithEmailAndPassword(
      getAuth(),
      user.email,
      user.password
    );
    const userId = credential.user.uid;

    const userDoc = await getDoc(doc(getFirestore(), 'users', userId));

    if (userDoc.exists()) {
      const userData = userDoc.data() as User;

      if (userData.approved) {
        const availableBio = await this.biometric.isAvailalbe();
        const bioIsRegister = localStorage.getItem('xionico_auth_cred_id');

        if (availableBio && !bioIsRegister) {
          await this.biometric.registerBio(userData.email);
          localStorage.setItem('xionico_user_temp', JSON.stringify(user));
        }

        if (userData.role === 0) {
          this.adminUser.set(true);
        }else if(userData.role === 1){
          this.supportUser.set(true)
        }

        return userData;
      } else {
        this.router.navigateByUrl('/aprobation');
        return null;
      }
    } else {
      this.viewSrv.toastPresent('Verifique usuario o contraseña', 'danger');
      throw new Error('El perfil de usuario no existe en la base de datos');
    }
  }

  updateDocument(path: string, data: any) {
    const documentRef = doc(this.db, path);
    return updateDoc(documentRef, data);
  }

  deleteDocument(path: string) {
    const documentRef = doc(this.db, path);
    return deleteDoc(documentRef);
  }

  async signOut() {
    return getAuth()
      .signOut()
      .then(() => {
        this.viewSrv.isLogin.set(false);
        this.router.navigateByUrl('/login');
      });
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

  private listenToAllUsers() {
    const q = query(collection(this.db, 'users'));

    onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(
        (doc) =>
          ({
            uid: doc.id,
            ...doc.data(),
          } as User)
      );
      this.allUsers.set(users);
    });
  }

  pendingUsers = computed(() => {
    const users = this.allUsers();

    if (!users) return [];

    return users.filter((user) => user.approved === false);
  });

  distribuidorasDeServidores = computed(() => {
    const servidores = this.allServersData();
    const nombres = servidores
      .map((s) => s.nombreDistribuidora)
      .filter(Boolean);
    return [...new Set(nombres)].map((nombre) => ({
      id: nombre,
      nombre: nombre,
    }));
  });

  ngOnDestroy() {
    if (this.unsubscribeList) {
      this.unsubscribeList();
    }
  }
}
