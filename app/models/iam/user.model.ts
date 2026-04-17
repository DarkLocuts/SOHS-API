import { BelongsTo, Field, Model } from '@utils'
import { Role } from '@models'

export class User extends Model {
    @Field(["fillable", "selectable", "searchable"])
    name!: string

    @Field(["fillable", "selectable", "searchable"])
    username!: string

    @Field(["fillable"])
    password!: string

    // =========================>
    // ## Relations
    // =========================>
    role_id!: number

    @BelongsTo(() => Role)
    role!: Role
}