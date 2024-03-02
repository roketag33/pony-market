import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'categories'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Un identifiant unique auto-incrémenté
      table.string('nom', 255).notNullable() // Le nom de la catégorie
      table.string('description', 255).nullable() // Description de la catégorie
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
