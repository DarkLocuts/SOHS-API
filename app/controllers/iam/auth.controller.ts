import { ControllerContext } from "elysia"
import bcrypt from 'bcrypt';
import { User } from "app/models"
import { auth, db } from '@utils';

export class AuthController {
    // =============================================>
    // ## Login with email & password
    // =============================================>
    static async login(c: ControllerContext) {
        await c.validation({
            username  :  ["required", "max:100"],
            password  :  ["required", "max:100"],
        })

        const { username, password } = c.body as Record<string, any>

        const user = await User.query().where("username", username).first();
        if (!user) return c.responseErrorValidation({username: ["Username tidak ditemukan!"]})

        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) return c.responseErrorValidation({password: ["Password salah!"]})
        
        const { token } = await auth.createAccessToken(user.id, c.request)

        c.responseSuccess({ user, token }, "Success")
    }


    // =============================================>
    // ## Get logged account
    // =============================================>
    static async me(c: ControllerContext) {
        const model = await User.query().expand(["role"]).where("id", c.user.id).getFirst()

        c.responseSuccess(model, "Success")
    }


    // =============================================>
    // ## Edit logged account
    // =============================================>
    static async update(c: ControllerContext) {
        const model = await User.query().findOrNotFound(c.user.id)

        await c.validation({
            name   :  "required",
        })

        const trx = await db.transaction()

        const body = c.body as Record<string, any>;

        model.fill(body)
        
        try {
            await model.save({ trx })
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }
        
        await trx.commit()
        c.responseSaved(model.toJSON())
    }


    // =============================================>
    // ## Edit password logged account
    // =============================================>
    static async updatePassword(c: ControllerContext) {
        const model = await User.query().findOrNotFound(c.user.id)

        await c.validation({
            old_password  :  ["required", "max:100"],
            new_password  :  ["required", "max:100"],
        })

        const checkPassword = await bcrypt.compare(c.payload?.old_password, model.password)
        if (!checkPassword) return c.responseErrorValidation({ old_password: ["Password lama salah!"] })

        const trx = await db.transaction()

        model.fill({
            password: await bcrypt.hash(c.payload?.new_password, 10)
        })
        
        try {
            await model.save({ trx })
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }
        
        await trx.commit()
        c.responseSaved(model.toJSON())
    }
}