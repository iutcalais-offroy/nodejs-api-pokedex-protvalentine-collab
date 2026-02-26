import express from 'express'
import { userRouter } from './user.route'

const print = console.log // remplacement de console

export const app = express()

const port = 3000

// Middleware pour parser le JSON
app.use(express.json())

// Route d'accueil
app.get('/', (_req, res) => {
  res.status(200).send('Bienvenue sur le serveur HTTP')
})

// Utilisation du router utilisateur
// Toutes les routes définies dans userRouter seront préfixées par /users
app.use('/users', userRouter)

// Démarrage du serveur
app.listen(port, () => {
  print(`Mon serveur démarre sur le port ${port}`)
})
