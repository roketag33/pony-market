import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Categorie extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column()
  public description: string
}
