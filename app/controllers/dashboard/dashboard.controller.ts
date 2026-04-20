import { DashboardService } from './_services/dashboard.service'

export class DashboardController {
    static async index() {
        const data = await DashboardService.getSummary()

        return {
            status   :  'success',
            message  :  'Dashboard data retrieved successfully',
            data     :  data
        }
    }
}
