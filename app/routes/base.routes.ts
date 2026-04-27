import { Elysia } from 'elysia'
import { api, middleware } from '@utils'
import { 
    AuthController,
    BaseController, 
    UserController,
    CategoryController,
    BrandController,
    LocationController,
    ProductController,
    OpnameController,
    DashboardController,
} from '@controllers'


export const routes = (app: Elysia) => app.group('/api', (route) => {
    route.get('/', BaseController.index)
    route.get('/features', BaseController.feature)
    route.get('/accesses', BaseController.access)
    
    route.post('/login', AuthController.login)

    route.use(middleware.Private)

    route.get('/me', AuthController.me)
    route.put('/me', AuthController.update)
    route.put('/me/update-password', AuthController.updatePassword)

    api(route, "/users", UserController);
    api(route, "/categories", CategoryController);
    api(route, "/brands", BrandController);
    api(route, "/locations", LocationController);

    api(route, "/products", ProductController);
    route.post('/products/sync', ProductController.sync);
    route.get('/product-labels', ProductController.getLabels);
    route.post('/product-labels', ProductController.generateLabels);
    api(route, "/opnames", OpnameController);
    route.put('/opnames/:id/cancel', OpnameController.cancel);
    route.get('/opnames/:id/products', OpnameController.getProducts);
    route.get('/opnames/:id/labels', OpnameController.getLabels);
    route.post('/opnames/:id/labels', OpnameController.addLabels);
    route.get('/opnames/:id/locations', OpnameController.getLocations);

    route.get('/dashboard', DashboardController.index);

    return route;
})