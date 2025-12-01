import { SourceWeb } from '../custom'

export {}

declare global {
    namespace Express {
        export interface Request {
            sourceWeb?: SourceWeb
        }
    }
}
