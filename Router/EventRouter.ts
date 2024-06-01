import express, { Router } from "express"
import { createEvent, deleteEvent, getAllEvents, getOneEvent } from "../Controller/EventController"
import { Protect, restrictTo } from "../Controller/AuthController"
const  router:Router = Router()

router.route("/Create").post(Protect,restrictTo(`admin`),createEvent)
 router.route("/get").get(getAllEvents)
 router.route("/getOne/:id").get(getOneEvent)
 router.route("/delete").delete(Protect,restrictTo(`admin`),deleteEvent)

export default router

