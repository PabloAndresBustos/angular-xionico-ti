import { Injectable, signal, computed, OnDestroy } from '@angular/core';
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
  Firestore,
  getDoc,
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

  /* DISTRIBUIDORA_ID = 'Logistica Zona Sur';
  SERVER_ID = 'SERVER01'; */

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
          const distId =
            profile.distribuidoraAsignada || profile.distribuidoraObjetivo;
          this.listenToServersRealTime(distId);
        }
      } else {
        this.authService.set(null);
      }
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
    const ROLES = environment.userProfile;

    if (!user || !user.approved) return [];

    const filteredData = allData.filter((server) => {
      if (user.role === ROLES.admin || user.role === ROLES.support) {
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

  async selectRecommended(distribuidoraId: string, serverId:string, serviceId: string, isRecommended: boolean) {
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
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  async signOut() {
    return getAuth().signOut();
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
      sucursales: []
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
