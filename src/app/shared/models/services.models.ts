export interface Services{
  id: string,
  name: string,
  recommended: boolean,
  status: 'RUNNING' | 'STOPPED' | string
}
