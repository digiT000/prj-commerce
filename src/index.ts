import 'reflect-metadata'
import './data-source'
import express from 'express'
import {
    categoryRouter,
    imageRouter,
    productRouter,
    userRouter,
} from './Routers'
import { handleSourceWebHeader } from './Middleware/headers.middleware'
import { initCloudinary } from './config/cloudinary'
import { errorHandle } from './Middleware/errorHandler.middleware'

const app = express()

app.use(express.json())

// Initiate cloudinary configuration
initCloudinary()

const apiRouter = express.Router()
apiRouter.use('', productRouter)
apiRouter.use('', categoryRouter)
apiRouter.use('', imageRouter)
apiRouter.use('', userRouter)

app.use('/api', handleSourceWebHeader, apiRouter)

app.use(errorHandle)

app.listen(8888, () => {
    console.log(`Listening on port : 8888`)
})
