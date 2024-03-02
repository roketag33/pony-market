import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Categorie from './Categorie'
import User from './User'

export default class Produit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public vendeurId: number

  @belongsTo(() => User)
  public vendeur: BelongsTo<typeof User>

  @column()
  public nom: string

  @column()
  public description: string

  @column()
  public prix: number

  @column()
  public etat: string

  @column()
  public localisation: string

  @column()
  public negociable: boolean

  @column()
  public quantite: number

  @column()
  public image_url: string

  @column()
  public tags: string

  @column()
  public methodePaiement: string

  @column()
  public methodeLivraison: string

  @column.dateTime({ autoCreate: true })
  public datePublication: DateTime

  @column()
  public categorieId: number

  @belongsTo(() => Categorie)
  public categorie: BelongsTo<typeof Categorie>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
