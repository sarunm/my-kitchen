import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class OrderTypeOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('char', { length: 1 })
  carrier!: string;

  @Column('int')
  number!: number;

  @Column('varchar', { length: 20, default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
