import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { UserRole } from '../types/custom'

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 100 })
    name: string

    @Column({ type: 'varchar', length: 255, select: false })
    hashPassword: string

    @Column({ type: 'varchar', length: 255, unique: true })
    @Index()
    email: string

    @Column({ type: 'boolean', default: false })
    hasVerifiedEmail: boolean

    @Column({ type: 'timestamp', nullable: true })
    emailVerifiedAt: Date | null

    @Column({ type: 'varchar', length: 500, nullable: true, select: false }) // ✅ Hide by default
    refreshToken: string | null

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date | null

    @DeleteDateColumn()
    deletedDate: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
