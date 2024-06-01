import express, { Router } from "express"
import { createJournalEntry, deleteJournalEntry, editJournalEntry, getJournalEntries, getOneJournal } from "../Controller/JournalController"

const  router:Router = Router()
 router.route("/Create").post(createJournalEntry)
 router.route("/get").get(getJournalEntries)
 router.route("/getOne/:id").get(getOneJournal)
 router.route("/Update/:id").patch(editJournalEntry)
 router.route("/delete").delete(deleteJournalEntry)

export default router