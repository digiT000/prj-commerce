import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { StatusImage, TypeImageRequest } from '../types/custom'

@Entity()
export class Image {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text')
    publicId: string

    @Column({ type: 'uuid', nullable: true })
    entityId: string

    @Column({ type: 'enum', enum: TypeImageRequest })
    entityType: TypeImageRequest

    @Column('text')
    urlOriginal: string // file asli

    @Column('text')
    urlOptimized: string // f_auto, q_auto, Webp

    @Column('text')
    urlMedium: string // w_500, f_auto, q_auto, Webp

    @Column({ type: 'enum', enum: StatusImage, default: StatusImage.TEMPORARY })
    status: StatusImage

    @DeleteDateColumn()
    deletedDate: Date

    @CreateDateColumn()
    createdAt: Date
}
