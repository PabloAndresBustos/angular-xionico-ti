interface Credencial {
  id?: string;
  servicio: string;
  usuario: string;
  password: string;
  distribuidora: string;
  sucursal: string;
  usuariosPermitidos: string[];
  createdAt: string;
}
