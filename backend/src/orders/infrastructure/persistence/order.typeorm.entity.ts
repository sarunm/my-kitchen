import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class OrderTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('char', { length: 1 })
  carrier: string;

  @Column('int')
  number: number;

  @Column('varchar', { length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
