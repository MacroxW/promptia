import bcrypt from 'bcryptjs'
import { env } from '@/config/env'
import { createUser, findUserByEmail, deleteUser } from '@/repositories/user.repository'

async function seed() {
    try {
        const email = 'user@gmail.com'
        const password = 'password12345'
        const name = 'Default User'

        const existingUser = await findUserByEmail(email)

        if (existingUser) {
            console.log('User already exists, deleting...')
            await deleteUser(email)
        }

        const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds)
        await createUser({
            email,
            password: hashedPassword,
            name
        })

        console.log('Default user created successfully')
    } catch (error) {
        console.error('Error seeding user:', error)
        process.exit(1)
    }
}

seed()
