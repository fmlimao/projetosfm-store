/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('products', table => {
    table.increments('product_id').primary()

    table.string('name').notNullable()
    table.decimal('price').notNullable().defaultTo(0)

    table.integer('active').notNullable().defaultTo(1)
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now())
    table.datetime('deleted_at')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('products')
}
