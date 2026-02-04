export type CaixaStatus = 'tranquilo' | 'atencao' | 'critico';
export type Energia = 'alta' | 'media' | 'baixa';
export type Pressao = 'leve' | 'normal' | 'alta';
export type EstadoCalculado = 'ATTACK' | 'CAUTION' | 'CRITICAL';

export interface DailyCheckin {
  id: string;
  user_id: string;
  date: Date;
  caixa_status: CaixaStatus;
  energia: Energia;
  pressao: Pressao;
  estado_calculado?: EstadoCalculado;
}
