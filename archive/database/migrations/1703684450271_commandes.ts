import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Commandes extends BaseSchema {
  protected tableName = 'commandes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('produit_id').unsigned().references('id').inTable('produits')
      table.integer('quantite').notNullable()
      table.decimal('prix_total', 10, 2).notNullable()
      table.string('statut', 50).notNullable()
      table.timestamp('date_commande', { useTz: true }).defaultTo(this.now())
      table.string('adresse_livraison', 255)
      table.string('methode_paiement', 255)
      table.date('date_livraison_prevue')
      table.text('remarques')

      // Créer des index si nécessaire
      // table.index('...')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
