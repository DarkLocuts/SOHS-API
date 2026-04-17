import { Opname, ProductLabel, OpnameProduct, OpnameProductLabel, Product, OpnameLocation, Location } from "@models"
import { db } from "@utils"


export const OpnameService = {
    create: async (userId: number) => {
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const dd = String(now.getDate()).padStart(2, '0')
        const dateStr = `${yyyy}${mm}${dd}`
        
        // Count existing opnames today to generate unique number
        const resultCount = await db(Opname.getTable())
            .where('number', 'like', `OPN-${dateStr}-%`)
            .count('id as total')
            .first() as any
        
        const count = resultCount?.total || 0
        const sequence = String(Number(count) + 1).padStart(4, '0')
        const number = `OPN-${dateStr}-${sequence}`

        return await db.transaction(async (trx) => {
            // 1. Create Opname
            const record = await Opname.create({
                number          :  number,
                start_at        :  now,
                status          :  "OPEN",
                created_by_id   :  userId
            }, trx)

            // 2. Fetch all products
            const products = await Product.query(trx).get()

            // 3. Create snapshots for all products
            for (const product of products) {
                await OpnameProduct.create({
                    opname_id       :  record.id,
                    product_id      :  product.id,
                    product_code    :  product.code,
                    product_name    :  product.name,
                    initial_stock   :  product.stock || 0,
                    final_stock     :  0,
                    deviation_stock :  -(product.stock || 0)
                }, trx)
            }

            return record
        })
    },

    complete: async (opnameId: number | string, userId: number) => {
        return await db.transaction(async (trx) => {
            const opname = await Opname.query(trx).findOrNotFound(opnameId)
            
            // 1. Finalize Meta
            opname.end_at = new Date()
            opname.status = "DONE"
            opname.closed_by_id = userId
            await opname.useTransaction(trx).save()
            
            // 2. Product Reconciliation
            const opnameProducts = await OpnameProduct.query(trx).where('opname_id', opnameId).get()
            for (const opnameProduct of opnameProducts) {
                const scanCountResult = await db(OpnameProductLabel.getTable())
                    .where('opname_id', opnameId)
                    .where('opname_product_id', opnameProduct.id)
                    .count('id as total')
                    .first() as any
                
                const count = Number(scanCountResult?.total || 0)
                opnameProduct.final_stock = count
                opnameProduct.deviation_stock = count - (opnameProduct.initial_stock || 0)
                await opnameProduct.useTransaction(trx).save()
            }

            // 3. Location Reconciliation
            // Clear existing summaries
            await db(OpnameLocation.getTable()).where('opname_id', opnameId).delete()

            // Group scans by location_id
            const labelsGrouped = await db(OpnameProductLabel.getTable())
                .where('opname_id', opnameId)
                .select('location_id')
                .count('id as total_stock')
                .groupBy('location_id') as any[]
            
            for (const group of labelsGrouped) {
                const locationId = group.location_id
                const location = await Location.query(trx).findOrNotFound(locationId)
                
                // Count unique products in this location for this opname
                const uniqueProductResult = await db(OpnameProductLabel.getTable())
                    .where('opname_id', opnameId)
                    .where('location_id', locationId)
                    .countDistinct('product_id as total_product')
                    .first() as any
                
                await OpnameLocation.create({
                    opname_id       :  Number(opnameId),
                    location_id     :  locationId,
                    location_name   :  location.name,
                    total_product   :  Number(uniqueProductResult?.total_product || 0),
                    total_stock     :  Number(group.total_stock || 0)
                }, trx)
            }

            return opname
        })
    },


    addLabels: async (opnameId: number | string, labels: { code: string, location_id: number }[]) => {
        const results: any[] = []

        await db.transaction(async (trx) => {
            for (const item of labels) {
                // 1. Find ProductLabel
                const productLabel = await ProductLabel.query(trx)
                    .where('code', item.code)
                    .with('product')
                    .getFirst()
                
                if (!productLabel) continue

                // 2. Find or Create OpnameProduct
                let opnameProduct = await OpnameProduct.query(trx)
                    .where('opname_id', opnameId)
                    .where('product_code', productLabel.product.code)
                    .getFirst()
                
                if (!opnameProduct) {
                    opnameProduct = await OpnameProduct.create({
                        opname_id       :  Number(opnameId),
                        product_code    :  productLabel.product.code,
                        product_name    :  productLabel.product.name,
                        initial_stock   :  productLabel.product.stock || 0,
                        final_stock     :  0,
                        deviation_stock :  -(productLabel.product.stock || 0)
                    }, trx)
                }

                // 3. Prevent Duplicates
                const existing = await OpnameProductLabel.query(trx)
                    .where('opname_id', opnameId)
                    .where('product_label_id', productLabel.id)
                    .getFirst()
                
                if (existing) continue

                // 4. Create OpnameProductLabel
                const newLabel = await OpnameProductLabel.create({
                    opname_id          :  Number(opnameId),
                    opname_product_id  :  opnameProduct.id,
                    product_id         :  productLabel.product_id,
                    product_label_id   :  productLabel.id,
                    location_id        :  item.location_id
                }, trx)

                // 5. Update OpnameProduct stock counts
                opnameProduct.final_stock = (opnameProduct.final_stock || 0) + 1
                opnameProduct.deviation_stock = (opnameProduct.final_stock || 0) - (opnameProduct.initial_stock || 0)
                await opnameProduct.useTransaction(trx).save()

                results.push(newLabel)
            }
        })

        return results
    }
}

