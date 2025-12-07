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

    static UserAlreadyExist() {
        return new UserError('Email is already used', 400)
    }
}
