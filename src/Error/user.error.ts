export class UserError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.name = 'UserError'
        this.statusCode = statusCode
        Error.captureStackTrace(this, this.constructor)
    }

    static EmailNotValid() {
        return new UserError('Please enter a valid email address', 400)
    }

    static PasswordNotValid() {
        return new UserError(
            'Password must be at least 8 characters long and include letters and numbers',
            400
        )
    }

    static NotYetVerified() {
        return new UserError(
            'Please verify your email address before logging in.',
            403
        )
    }

    static EmailAlreadyVerified() {
        return new UserError(
            'Your email is already verified! You can now log in',
            400
        )
    }

    static AdminOnly() {
        return new UserError(
            'This action is only available to administrators',
            403
        )
    }

    static UserAlreadyExist() {
        return new UserError('Email is already used', 400)
    }

    static NotFound(userId?: string) {
        return new UserError(
            userId
                ? `We couldn't find a user with ID: ${userId}`
                : 'User not found',
            404
        )
    }

    // TOKEN
    static TokenNotProvided() {
        return new UserError('Please provide token', 401)
    }

    static InvalidToken() {
        return new UserError('Your token is invalid', 401)
    }

    static TokenIsExpired() {
        return new UserError('Your token has expired', 401)
    }
}
