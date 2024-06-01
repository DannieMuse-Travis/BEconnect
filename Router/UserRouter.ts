import express, { Router } from "express"
import { DeleteMe, UpdateMe, createUser, deleteUser, getAllUser, getMe, getOneUser, updateUser } from "../Controller/UserController"
import { forgotPassword, Login, Protect, ResetPassword, SignUp, logout, restrictTo, updatePassword } from "../Controller/AuthController"



 const  router:Router = Router()

 router.route(`/signup`).post(SignUp)
 router.route(`/Login`).post(Login)
 router.route(`/forgotPass`).post(forgotPassword)
 router.route(`/resetPass/:token`).patch(ResetPassword)
 router.route('/logout').get(logout)

// Protect all Route after middleware
 router.use(Protect)

 router.route(`/updatemyPass`).patch(updatePassword)
 router.route(`/updateMe`).patch(UpdateMe)
 router.route(`/deleteMe`).delete(DeleteMe)
router.route(`/Me`).get(getMe,getOneUser)

//  Restrict all Route after middleware
router.use(restrictTo(`admin`)) 

router.route(`/users`)
.get(getAllUser)
.get(createUser)
  router.route(`/:id`)
  .get(getOneUser)
  .patch(updateUser)
  .delete(deleteUser)


  

  export default router