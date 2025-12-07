import { JwtPayload } from '../../Utils/token.utils'
import { SourceWeb } from '../custom'

export {}

declare global {
    namespace Express {
        export interface Request {
            sourceWeb?: SourceWeb
            user?: JwtPayload
        }
    }
}
