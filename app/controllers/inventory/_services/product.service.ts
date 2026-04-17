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


    generate: async (payload: any[]) => {}
}
