import { Model, SoftDelete, Field, BelongsTo } from '@utils'
import { Opname, Brand } from '@models'

export class OpnameBrand extends Model {
    // =====================>
    // ## Field
    // =====================>
    @Field(["fillable","selectable"])
    total_product!: number

    @Field(["fillable","selectable"])
    total_stock!: number

    @SoftDelete()
    deleted_at!: Date


    // =========================>
    // ## Relations
    // =========================>
    opname_id!: number
    @BelongsTo(() => Opname)
    opname!: Opname

    brand_id!: number
    @BelongsTo(() => Brand)
    brand!: Brand


    // =====================>
    // ## Attribute
    // =====================>



    // =====================>
    // ## Hook
    // =====================>

}