import express from 'express'


const app = express()

app.route('/').all(() => console.log('now you request to me'))


export default app;