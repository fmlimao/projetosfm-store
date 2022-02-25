/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('users').del()
  await knex('users').insert([
    { user_id: 1, name: 'Usuário 1', email: 'usu1@email.com', password: '123456' },
    { user_id: 2, name: 'Usuário 2', email: 'usu2@email.com', password: '123456' },
    { user_id: 3, name: 'Usuário 3', email: 'usu3@email.com', password: '123456' }
  ])

  await knex('products').del()
  await knex('products').insert([
    { product_id: 1, name: 'Produto 1', price: 10.99 },
    { product_id: 2, name: 'Produto 2', price: 15.00 },
    { product_id: 3, name: 'Produto 3', price: 9.65 }
  ])
}
