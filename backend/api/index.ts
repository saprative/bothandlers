import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: 'http://localhost:8080',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
)

app.get('/', (c) => {
  return c.text('API is running!')
})

const port = 8001
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
