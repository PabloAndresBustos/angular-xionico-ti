export interface User {
  uid: string,
  email: string,
  password: string,
  name: string,
  role: number,
  approved: boolean,
  distribuidoraAsignada?:string,
  sucursales:string[]
  distribuidoraObjetivo: string
  active: boolean,
}
