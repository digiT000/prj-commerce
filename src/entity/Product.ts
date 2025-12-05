import {
    AfterInsert,
    BeforeInsert,
    BeforeUpdate,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm'
import slugify from 'slugify'
import { Category } from './Category'
import { Status } from '../types/custom'
import { Image } from './Image'

@Entity()
@Unique(['slug'])
export class Product {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string

    @Column('text')
    name: string

    @Column('decimal')
    price: number

    images?: Image[]

    @Column({ type: 'varchar' })
    @Index()
    slug: string

    @Column('text', {
        nullable: false,
    })
    @ManyToOne(() => Category, (category) => category.id, {
        onDelete: 'RESTRICT',
        eager: true,
    })
    categoryId: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @Column({ type: 'enum', enum: Status, default: Status.ACTIVE })
    status: Status

    @DeleteDateColumn()
    deletedDate: Date

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
