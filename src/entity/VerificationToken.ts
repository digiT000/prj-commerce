import { Column, Entity } from 'typeorm'

@Entity()
export class VerificationToken {
    @Column('uuid')
    userId: string

    @Column()
    token: string

    @Column()
    expiresAt: Date
}
