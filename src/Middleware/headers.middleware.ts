import { Request, Response, NextFunction } from 'express'
import { SOURCE_WEB, SourceWeb } from '../types/custom'

export function handleSourceWebHeader(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const sourceWebHeader = req.headers['source-web']
    let sourceWeb: SourceWeb = SOURCE_WEB[0]
    if (
        typeof sourceWebHeader === 'string' &&
        SOURCE_WEB.includes(sourceWebHeader)
    ) {
        sourceWeb = sourceWebHeader
    }
    req.sourceWeb = sourceWeb
    return next()
}
