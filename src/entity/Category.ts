import slugify from 'slugify'
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { Product } from './Product'
import { Status } from '../types/custom'

@Entity()
export class Category {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string

    @Column({ type: 'text', nullable: false, unique: true })
    name: string

    @OneToMany(() => Product, (product) => product.categoryId)
    products: Product[]

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status: Status

    @DeleteDateColumn()
    deletedDate: Date

    @Column({ type: 'text', nullable: false, unique: true })
    @Index()
    slug: string

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
        this.slug = slugify(this.name, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: true,
        })
    }
}
