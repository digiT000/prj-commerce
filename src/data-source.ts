import { DataSource } from 'typeorm'
import { Product } from './entity/Product'
import { Category } from './entity/Category'
import { Image } from './entity/Image'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5433,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    synchronize: true,
    logging: true,
    entities: [Product, Category, Image],
    subscribers: [],
    migrations: [],
})

const initializeDataSource = async () => {
    try {
        await AppDataSource.initialize()
        console.log('Data Source has been initialized!')
    } catch (error) {
        console.error('Error during Data Source initialization', error)
    }
}

initializeDataSource()
