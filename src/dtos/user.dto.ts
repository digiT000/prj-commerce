import { User } from '../entity/User'

export type LoginRequest = {
    email: string
    password: string
}

export type RegisterRequest = {
    name: string
    email: string
    password: string
}

export type LoginResponse = {
    name: string
    email: string
    refreshToken: string
    accessToken: string
}
