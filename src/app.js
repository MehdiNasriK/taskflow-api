import express from 'express'
import userController from './modules/auth/userController.js'

const app = express()

app.use(express.json())

app.route('/users').get(userController.getAllUser).post(userController.creatUser)
app.route('/users/:id').delete(userController.deleteUser)



export default app;