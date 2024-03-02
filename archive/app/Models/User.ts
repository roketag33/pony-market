import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nom: string

  @column()
  public prenom: string

  @column()
  public pseudo: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public motDePasse: string

  @column()
  public adresse: string

  @column()
  public telephone: string

  @column()
  public role: string

  @column()
  public dateDeNaissance: DateTime

  @column()
  public genre: string

  @column()
  public avatar: string

  @column()
  public newsletterSubscribed: boolean

  @column()
  public adresseComplementaire: string

  @column()
  public ville: string

  @column()
  public codePostal: string

  @column()
  public pays: string

  @column()
  public instructionsLivraison: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
