import bcrypt from 'bcryptjs'
import { env } from '@/config/env'
import { userRepository } from '@/repositories/user.repository'

async function seed() {
    try {
        const email = 'user@gmail.com'
        const password = 'password12345'
        const name = 'Default User'

        const existingUser = await userRepository.findByEmail(email)

        if (existingUser) {
            console.log('User already exists, deleting...')
            await userRepository.delete(email)
        }

        const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds)
        await userRepository.create({
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
