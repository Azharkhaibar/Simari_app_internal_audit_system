import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  notification_id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  user_id: number | null;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ nullable: true })
  category: string;

  @CreateDateColumn()
  @Index()
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  expires_at: Date | null;
}
