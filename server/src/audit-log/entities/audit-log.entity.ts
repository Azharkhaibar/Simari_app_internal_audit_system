import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum ModuleType {
  // HOLDING (11)
  INVESTASI = 'INVESTASI',
  PASAR = 'PASAR',
  LIKUIDITAS = 'LIKUIDITAS',
  OPERASIONAL = 'OPERASIONAL',
  HUKUM = 'HUKUM',
  STRATEJIK = 'STRATEJIK',
  KEPATUHAN = 'KEPATUHAN',
  REPUTASI = 'REPUTASI',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SYSTEM = 'SYSTEM',
  RAS = 'RAS',

  // OJK (13)
  HUKUM_OJK = 'HUKUM_OJK',
  INVESTASI_OJK = 'INVESTASI_OJK',
  KEPATUHAN_OJK = 'KEPATUHAN_OJK',
  KONSENTRASI_OJK = 'KONSENTRASI_OJK',
  KREDIT_OJK = 'KREDIT_OJK',
  LIKUIDITAS_OJK = 'LIKUIDITAS_OJK',
  OPERASIONAL_OJK = 'OPERASIONAL_OJK',
  PASAR_OJK = 'PASAR_OJK',
  PERMODALAN_OJK = 'PERMODALAN_OJK',
  RENTABILITAS_OJK = 'RENTABILITAS_OJK',
  REPUTASI_OJK = 'REPUTASI_OJK',
  STRATEGIS_OJK = 'STRATEGIS_OJK',
  TATAKELOLA_OJK = 'TATAKELOLA_OJK',
}

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User | null;

  @Column({ type: 'enum', enum: ActionType })
  action: ActionType;

  @Column({ type: 'enum', enum: ModuleType })
  module: ModuleType;

  @Column('text')
  description: string;

  @Column({ type: 'text', nullable: true })
  endpoint: string | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ip_address: string;

  @Column({ name: 'is_success', default: true })
  isSuccess: boolean;

  @Index()
  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'json', nullable: true })
  metadata: any;
}