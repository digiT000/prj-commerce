import 'reflect-metadata'
import './data-source'
import express from 'express'
import { categoryRouter, productRouter } from './Routers'
import { handleSourceWebHeader } from './Middleware/headers.middleware'

const app = express()

app.use(express.json())

const apiRouter = express.Router()
apiRouter.use('', productRouter)
apiRouter.use('', categoryRouter)

app.use('/api', handleSourceWebHeader, apiRouter)

app.listen(8888, () => {
    console.log(`Listening on port : 8888`)
})
