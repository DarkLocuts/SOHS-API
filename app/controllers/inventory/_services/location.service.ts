import { Location, ProductLabel } from "@models"
import { db } from "@utils"

export const LocationService = {
    getDetail: async (id: string | number) => {
        const location          =  await Location.query().findOrNotFound(id)

        const totalStock        =  await db('product_labels')
            .where('location_id', id)
            .whereNull('deleted_at')
            .count('id as total')
            .first()
            .then(r => parseInt(String(r?.total ?? 0)))

        const totalProducts     =  await db('product_labels')
            .where('location_id', id)
            .whereNull('deleted_at')
            .countDistinct('product_id as total')
            .first()
            .then(r => parseInt(String(r?.total ?? 0)))

        const products          =  await db('product_labels as pl')
            .join('products as p', 'pl.product_id', 'p.id')
            .where('pl.location_id', id)
            .whereNull('pl.deleted_at')
            .whereNull('p.deleted_at')
            .select('p.id', 'p.code', 'p.name')
            .count('pl.id as stock')
            .groupBy('p.id', 'p.code', 'p.name')
            .then(rows => rows.map((r: any) => ({
                ...r,
                stock: parseInt(String(r.stock ?? 0))
            })))

        return {
            ...location,
            total_products  :  totalProducts,
            total_stock     :  totalStock,
            products        :  products
        }
    }
}
