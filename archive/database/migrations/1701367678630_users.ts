import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      table.string('nom', 255).notNullable()
      table.string('prenom', 255).notNullable()
      table.string('pseudo', 255).notNullable().unique()
      table.string('email', 255).notNullable().unique()
      table.string('mot_de_passe', 180).notNullable()
      table.string('adresse', 255).nullable()
      table.string('telephone', 50).nullable()
      table.string('role', 50).defaultTo('user')
      table.date('date_de_naissance').nullable()
      table.string('genre', 50).nullable()
      table.string('avatar', 255).nullable()
      table.boolean('newsletter_subscribed').defaultTo(false)
      table.string('adresse_complementaire', 255).nullable()
      table.string('ville', 255).nullable()
      table.string('code_postal', 20).nullable()
      table.string('pays', 255).nullable()
      table.text('instructions_livraison').nullable()
      
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
