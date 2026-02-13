/* eslint-disable no-console */
import { Request, Response, Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../database'

export const authRouter = Router()

// POST /auth/sign-up
// Accessible via POST /auth/sign-up
authRouter.post('/sign-up', async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    // 1. Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { username },
    })

    if (!user) {
      return res
        .status(401)
        .json({ error: "Nom d'utilisateur ou mot de passe incorrect" })
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: "Nom d'utilisateur ou mot de passe incorrect" })
    }

    // 3. Générer le JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '168h' },
    )

    // 4. Retourner le token
    return res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return res.status(500).json({ error: 'Erreur serveur' })
  }
})
