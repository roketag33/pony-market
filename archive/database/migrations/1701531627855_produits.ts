import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'produits'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('vendeur_id').unsigned().references('id').inTable('users')
      table.string('nom', 255).notNullable()
      table.text('description').nullable()
      table.decimal('prix', 10, 2).notNullable()
      table.string('etat', 100).notNullable()
      table.string('localisation', 255).nullable()
      table.boolean('negociable').defaultTo(false)
      table.string('image_url', 2048).nullable()
      table.date('date_publication').notNullable()
      table.string('methode_paiement', 255).nullable()
      table.string('methode_livraison', 255).nullable()
      table.integer('categorie_id').unsigned().references('id').inTable('categories')
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
