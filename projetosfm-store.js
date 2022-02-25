console.clear()

const conn = require('./src/database/conn')
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
  res.locals.cart = req.cookies.cart || {}
  res.locals.cart.items = res.locals.cart.items || []

  // atualizando total por item
  res.locals.cart.items = res.locals.cart.items.map(item => {
    item.total = Number((item.price * item.quantity).toFixed(2))
    return item
  })

  // atualizando totais dos itens
  res.locals.cart.total = res.locals.cart.items.reduce((total, item) => {
    return Number((total + item.total).toFixed(2))
  }, 0)

  res.cookie('cart', res.locals.cart)

  next()
}

app.get('/', verifyAuthMiddleware, verifyCartMiddleware, async (req, res) => {
  const products = await conn.getAll(`
    SELECT product_id, name, price
    FROM products
    WHERE deleted_at IS NULL
    AND active = 1
    ORDER BY name;
  `)

  res.render('home', {
    products
  })
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

app.post('/cart-add', verifyAuthMiddleware, verifyCartMiddleware, async (req, res) => {
  const productId = Number(req.body.product_id || null)
  const quantity = Number(req.body.quantity || null)

  // buscar produto
  const product = await conn.getOne(`
    SELECT product_id, name, price
    FROM products
    WHERE deleted_at IS NULL
    AND active = 1
    AND product_id = :productId
    LIMIT 1;
  `, {
    productId
  })

  if (product) {
    // verificar se o produto já está no carrinho
    const item = res.locals.cart.items.find(item => item.product_id === productId)

    if (item) {
      item.quantity += quantity
    } else {
      // adicionar ao carrinho
      res.locals.cart.items.push({
        ...product,
        quantity
      })
    }

    res.cookie('cart', res.locals.cart)
  }

  // redirecionar para a home
  res.redirect('/')
})

app.post('/cart-item-update', verifyAuthMiddleware, verifyCartMiddleware, async (req, res) => {
  const productId = Number(req.body.product_id || null)
  const quantity = Number(req.body.quantity || null)

  // verificar se o produto já está no carrinho
  const item = res.locals.cart.items.find(item => item.product_id === productId)

  if (item) {
    // se quantidade for 0, remover do carrinho
    if (quantity === 0) {
      res.locals.cart.items = res.locals.cart.items.filter(item => item.product_id !== productId)
    } else {
      item.quantity = quantity
    }
  }

  res.cookie('cart', res.locals.cart)

  // redirecionar para o carrinho
  res.redirect('/cart')
})

const PORT = process.env.PORT || 15000
app.listen(PORT, async () => {
  console.log(`Server running: http://localhost:${PORT}/`)
})
