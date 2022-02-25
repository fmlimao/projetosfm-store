const cookieParser = require('cookie-parser')
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const logger = require('morgan')
const path = require('path')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './src/views'))

app.use(expressLayouts)
app.set('layout', 'layout')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(logger('dev'))
app.use(cookieParser())

const verifyAuthMiddleware = (req, res, next) => {
  if (req.cookies.auth) {
    res.locals.auth = req.cookies.auth
  } else {
    res.locals.auth = false
  }

  next()
}

const verifyCartMiddleware = (req, res, next) => {
  if (req.cookies.cart) {
    res.locals.cart = req.cookies.cart
  } else {
    res.locals.cart = {
      items: []
    }
  }

  next()
}

app.get('/', verifyAuthMiddleware, verifyCartMiddleware, (req, res) => {
  res.render('home', {})
})

app.get('/login', verifyAuthMiddleware, verifyCartMiddleware, (req, res) => {
  if (res.locals.auth) {
    res.redirect('/')
  }

  const ret = {
    error: false,
    messages: [],
    fields: {
      email: {
        value: 'email@email.com',
        error: false,
        messages: []
      },
      password: {
        value: '123456',
        error: false,
        messages: []
      }
    }
  }

  res.render('login', { ret })
})

app.post('/login', verifyAuthMiddleware, verifyCartMiddleware, (req, res) => {
  if (res.locals.auth) {
    res.redirect('/')
  }

  const { email, password } = req.body

  const ret = {
    error: false,
    messages: [],
    fields: {
      email: {
        value: email,
        error: false,
        messages: []
      },
      password: {
        value: password,
        error: false,
        messages: []
      }
    }
  }

  if (email === '') {
    ret.error = true
    ret.fields.email.error = true
    ret.fields.email.messages.push('O campo email é obrigatório.')
  }

  if (password === '') {
    ret.error = true
    ret.fields.password.error = true
    ret.fields.password.messages.push('O campo senha é obrigatório.')
  }

  if (ret.error) {
    ret.messages.push('Verifique todos os campos.')
    return res.render('login', { ret })
  }

  if (email !== 'email@email.com' || password !== '123456') {
    ret.error = true
    ret.messages.push('Usuário ou senha inválidos')
    return res.render('login', { ret })
  }

  res.cookie('auth', {
    id: 1,
    name: 'Usuário 1'
  })

  return res.redirect('/')
})

app.get('/logout', verifyAuthMiddleware, verifyCartMiddleware, (req, res) => {
  res.clearCookie('auth')
  res.redirect('/')
})

app.get('/cart', verifyAuthMiddleware, verifyCartMiddleware, (req, res) => {
  res.render('cart', {
    cart: res.locals.cart
  })
})

const PORT = process.env.PORT || 15000
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/`)
})
