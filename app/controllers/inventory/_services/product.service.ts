import { Brand, Category, Product } from '@app/models';
import { db } from '@utils'

export const ProductService = {
    sync: async (payload: any[]) => {
        const syncedProducts: any[] = [];

        await db.transaction(async (trx) => {
            for (const item of payload) {
                const code          =  item.code;
                let   name          =  item.name;
                const stock         =  item.stock || 0;
                const brandName     =  item.brand;
                const categoryName  =  item.category;

                if (!code) continue;

                if (!name || name.trim() === '') {
                    name = code;
                }

                let brandId = null;
                if (brandName) {
                    let brand = await Brand.query().where('name', 'ilike', brandName).getFirst();

                    if (!brand) {
                        brand = await Brand.create({
                            name  :  brandName
                        });
                    }

                    brandId = brand.id;
                }

                let categoryId = null;
                if (categoryName) {
                    let category = await Category.query().where('name', 'ilike', categoryName).getFirst();

                    if (!category) {
                        category = await Category.create({
                            name  :  categoryName
                        });
                    }

                    categoryId = category.id;
                }

                const newProduct = await Product.upsert({
                    code         :  code,
                    name         :  name,
                    stock        :  stock,
                    brand_id     :  brandId,
                    category_id  :  categoryId,
                }, ["code"]);

                syncedProducts.push(newProduct);
            }
        });

        return syncedProducts;
    },


    generate: async (payload: any[]) => {},


    getDetail: async (id: string | number) => {
        const product           =  await Product.query().expand(["brand", "category"]).where('id', id).getFirst()

        const totalStock        =  await db('product_labels')
            .where('product_id', id)
            .whereNull('deleted_at')
            .count('id as total')
            .first()
            .then(r => parseInt(String(r?.total ?? 0)))

        const totalLocations    =  await db('product_labels')
            .where('product_id', id)
            .whereNull('deleted_at')
            .countDistinct('location_id as total')
            .first()
            .then(r => parseInt(String(r?.total ?? 0)))

        const locations         =  await db('product_labels as pl')
            .join('locations as l', 'pl.location_id', 'l.id')
            .where('pl.product_id', id)
            .whereNull('pl.deleted_at')
            .whereNull('l.deleted_at')
            .select('l.id', 'l.code', 'l.name')
            .count('pl.id as stock')
            .groupBy('l.id', 'l.code', 'l.name')
            .then(rows => rows.map((r: any) => ({
                ...r,
                stock: parseInt(String(r.stock ?? 0))
            })))

        return {
            id               :  product.id,
            name             :  product.name,
            code             :  product.code,
            brand            :  product.brand,
            category         :  product.category,
            total_stock      :  totalStock,
            total_locations  :  totalLocations,
            locations        :  locations
        }
    }
}
