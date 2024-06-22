import crypto from 'crypto'

export async function generateResetTokenHash() {

    const token = crypto.randomBytes(32).toString('hex')

    const hash = crypto.createHash('sha256').update(token).digest('hex')

    return { token, hash }
}

export async function compareTokenHash(token: string, hash: string) {

    const hashCompared = crypto.createHash('sha256').update(token).digest('hex')

    if (hashCompared == hash) {
        return true
    } else { return false }
}