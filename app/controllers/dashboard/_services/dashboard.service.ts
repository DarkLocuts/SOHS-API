import { Product, Opname, OpnameProduct } from '@models'
import { db } from '@utils'

export class DashboardService {
    static async getSummary() {
        const now = new Date()
        
        const skuCountQuery = await db('products').whereNull('deleted_at').count('* as total').first()
        const total_sku = Number(skuCountQuery?.total || 0)

        const stockSumQuery = await db('products').whereNull('deleted_at').sum('stock as total').first()
        const total_stock = Number(stockSumQuery?.total || 0)

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const stock_variance: { month: string, value: number, opname_count: number, _year: number, _month: number }[] = []
        
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            stock_variance.push({
                month: monthNames[d.getMonth()],
                value: 0,
                opname_count: 0,
                _year: d.getFullYear(),
                _month: d.getMonth()
            })
        }

        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)

        const opnames = await Opname.query()
            .expand(['products'])
            .whereNull('deleted_at')
            .where('start_at', '>=', startDate)
            .get()

        for (const opname of opnames) {
            const opDate = new Date(opname.start_at)
            const opYear = opDate.getFullYear()
            const opMonth = opDate.getMonth()

            const varianceSlot = stock_variance.find(v => v._year === opYear && v._month === opMonth)
            if (varianceSlot) {
                varianceSlot.opname_count += 1
                const totalDeviation = opname.products?.reduce((sum: number, p: OpnameProduct) => sum + Math.abs(p.deviation_stock || 0), 0) || 0
                varianceSlot.value += totalDeviation
            }
        }

        const cleanedStockVariance = stock_variance.map(({ _year, _month, ...rest }) => rest)

        const recentOpnamesData = await Opname.query()
            .expand(['products'])
            .whereNull('deleted_at')
            .orderBy('start_at', 'desc')
            .limit(5)
            .get()

        const recent_opnames = recentOpnamesData.map(opname => {
            const variance = opname.products?.reduce((sum: number, p: OpnameProduct) => sum + Math.abs(p.deviation_stock || 0), 0) || 0
            return {
                id: opname.id,
                number: opname.number,
                start_at: opname.start_at,
                end_at: opname.end_at,
                status: opname.status,
                variance: variance
            }
        })

        return {
            summary: {
                total_sku,
                total_stock
            },
            stock_variance: cleanedStockVariance,
            recent_opnames
        }
    }
}
