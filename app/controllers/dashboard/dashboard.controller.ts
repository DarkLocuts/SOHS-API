import { DashboardService } from './_services/dashboard.service'

export class DashboardController {
    static async index() {
        try {
            const data = await DashboardService.getSummary()

            return {
                status  : 'success',
                message : 'Dashboard data retrieved successfully',
                data    : data
            }
        } catch (error: any) {
            return {
                status  : 'error',
                message : error.message || 'Failed to retrieve dashboard data',
                data    : null
            }
        }
    }
}
