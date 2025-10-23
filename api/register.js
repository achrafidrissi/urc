import { db } from '@vercel/postgres'
import { arrayBufferToBase64, stringToArrayBuffer } from "../lib/base64"

export const config = {
    runtime: 'edge',
}

export default async function handler(request) {
    try {
        const { login, email, password } = await request.json()

        if (!login || !email || !password) {
            return new Response(JSON.stringify({ message: "Champs manquants" }), {
                status: 400,
                headers: { 'content-type': 'application/json' },
            })
        }

        const hash = await globalThis.crypto.subtle.digest(
            'SHA-256',
            stringToArrayBuffer(login + password)
        )
        const hashed64 = arrayBufferToBase64(hash)
        const externalId = crypto.randomUUID()

        const client = await db.connect()

        const { rowCount: exists } = await client.sql`
      SELECT * FROM users WHERE username = ${login} OR email = ${email};
    `
        if (exists > 0) {
            return new Response(JSON.stringify({ message: "Utilisateur déjà existant" }), {
                status: 409,
                headers: { 'content-type': 'application/json' },
            })
        }

        await client.sql`
            INSERT INTO users (username, email, password, created_on, last_login, external_id)
            VALUES (${login}, ${email}, ${hashed64}, now(), now(), ${externalId});
        `

        return new Response(JSON.stringify({ message: "Utilisateur créé avec succès" }), {
            status: 201,
            headers: { 'content-type': 'application/json' },
        })

    } catch (error) {
        console.error("Erreur serveur :", error)
        return new Response(JSON.stringify({ message: "Erreur serveur" }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        })
    }
}
