import type { ControllerContext } from "elysia"
import bcrypt from 'bcrypt';
import { db, permission, ValidationRules } from '@utils'
import { User } from "app/models"

export const UserPermission = permission.register({
  "100": {
    name: "User Management",
    accesses: {
      "01": "View",
      "02": "create",
      "03": "update",
      "04": "delete",
    }
  },
})

export class UserController {
  // ========================================>
  // ## Display a listing of the resource.
  // ========================================>
  static async index(c: ControllerContext) {    
    const users = await User.query().resolve(c)

    c.responseData(users.data, users.total)
  }

  // =============================================>
  // ## Store a newly created resource.
  // =============================================>
  static async store(c: ControllerContext) {
    
    await c.validation<User>({
      name      :  ["required", "max:200"],
      username  :  ["required", "max:100"],
      password  :  ["required", "max:100"],
    })

    const trx = await db.transaction()

    let record = new User();

    record.fill(c.body as Record<string, any>);
    record.password = await bcrypt.hash(record.password, 10);

    try {
      await record.save();       
    } catch (err) {
      await trx.rollback()
      return c.responseError(err as Error, "Create User")
    }

    await trx.commit()

    c.responseSaved(record)
  }


  // ============================================>
  // ## Update the specified resource.
  // ============================================>
  static async update(c: ControllerContext) {
    let record = await User.query().findOrNotFound(c.params.id);

    await c.validation({
        name      :  ["required"],
        username  :  ["required", "max:100"],
        password  :  ["required", "max:100"],
    })
    
    const trx = await db.transaction()

    record.fill(c.body as Record<string, any>);
    record.password = await bcrypt.hash(record.password, 10);

    try {
        record = await record.save();
    } catch (err) {
        await trx.rollback()
        return c.responseError(err as Error, "Create User")
    }

    await trx.commit()
    c.responseSaved(record)
  }


  // ===============================================>
  // ## Remove the specified resource.
  // ===============================================>
  static async destroy(c: ControllerContext) {
    let record = await User.query().findOrNotFound(c.params.id)
    
    try {
        record = await record.delete()
    } catch (err) {
        c.responseError(err as Error, "Delete User")
    }

    c.responseSuccess(record)
  }
}