// Topshiriq-4: Kutubxona Tizimi
// Talablar:
// 1. Kitob modeli:
// ○ id (avtomatik)
// ○ nomi
// ○ muallif
// ○ janr
// ○ nashrYili
// ○ sahifalar
// ○ holat (mavjud, olingan)
// ○ olgOdam (agar olingan bo'lsa)

// 2. CRUD operatsiyalari:
// ○ Barcha kitoblarni ko'rish
// ○ Bitta kitobni ID bo'yicha ko'rish
// ○ Yangi kitob qo'shish
// ○ Kitob ma'lumotlarini yangilash
// ○ Kitobni o'chirish

// 3. Qo'shimcha route'lar:
// ○ Janr bo'yicha filtrlash: /api/kitoblar?janr=roman
// ○ Muallif bo'yicha qidirish: /api/kitoblar?muallif=Abdulla%20Qodiriy
// ○ Mavjud kitoblar: /api/kitoblar/mavjud
// ○ Olingan kitoblar: /api/kitoblar/olingan
// ○ Kitob olish: POST /api/kitoblar/:id/ol
// ○ Kitob qaytarish: POST /api/kitoblar/:id/qaytarish

// 4. Validatsiya:
// ○ Nomi va muallif bo'sh bo'lmasligi kerak
// ○ Nashr yili 1800-2024 oralig'ida bo'lishi kerak
// ○ Sahifalar 1 dan katta bo'lishi kerak

import { promises as fs } from "fs";
import express, { response } from "express"
import cors from "cors"
import { json } from "stream/consumers";

const server = express()
server.use(express.json())
server.use(cors())

///////////////////////////////////////////////////// GET
server.get("/", (req, resp) => {
    resp.send({ health: "super server" })
})

server.get("/kitoblar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))

    if (req.query.janr) {
        data = data.filter(item => item.janr === req.query.janr)
    }
    if (req.query.muallif) {
        data = data.filter(item => item.muallif === req.query.muallif)
    }
    resp.send(data)
})

server.get("/kitoblar/:root", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))
    let param = req.params.root
    let paramID = Number(param)

    if (Number.isFinite(paramID)) {
        let find_id = data.find(item => item.id === paramID)
        resp.send(find_id)
        return
    }

    if (param === "mavjud") {
        data = data.filter(item => item.holat === param)
        resp.send(data)
        return
    }

    if (param === "olingan") {
        data = data.filter(item => item.holat === param)
        resp.send(data)
        return
    }

    resp.status(404).json({ error: "bunaqa root yo'q" })
})


///////////////////////////////////////////////////// POST
server.post("/kitoblar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))
    let { nomi, muallif, janr, nashrYili, sahifalar } = req.body
    let new_book = {
        id: data.length + 1,
        nomi,
        muallif,
        janr,
        nashrYili,
        sahifalar,
        holat: "mavjud",
        olgOdam: null
    }
    data.push(new_book)
    await fs.writeFile("./kitoblar.json", JSON.stringify(data))
    resp.send(new_book)
})

// ○ Kitob olish: POST /api/kitoblar/:id/ol
// ○ Kitob qaytarish: POST /api/kitoblar/:id/qaytarish
server.post("/kitoblar/:id/ol", async (req, resp) => {
    let param = Number(req.params.id)
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))
    let find_id = data.find(item => item.id === param)
    let { olgOdam } = req.body
    let old = JSON.parse(JSON.stringify(find_id))
    if (olgOdam) {
        find_id.olgOdam = olgOdam
        find_id.holat = "olingan"
    }
    await fs.writeFile("./kitoblar.json", JSON.stringify(data))
    resp.send({
        kitob_olindi: "kitob holadi",
        old: old,
        new: find_id
    })
})

server.post("/kitoblar/:id/qaytarish", async (req, resp) => {
    let param = Number(req.params.id)
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))
    let find_id = data.find(item => item.id === param)
    if (!find_id) {
        resp.send({ error: "bunaqa id yo'q" })
        return
    }
    find_id.olgOdam = null
    find_id.holat = "mavjud"
    await fs.writeFile("./kitoblar.json", JSON.stringify(data))
    resp.send(find_id)
})



///////////////////////////////////////////////////// PATCH
server.patch("/kitoblar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))
    let { id, nomi, muallif, janr, nashrYili, sahifalar, holat } = req.body
    let find_id = data.find(item => item.id === Number(id))
    if (!find_id) {
        resp.send({ error: "bunaqa id yo'q" })
        return
    }
    let old = JSON.parse(JSON.stringify(find_id))
    if (nomi) {
        find_id.nomi = nomi
    }
    if (muallif) {
        find_id.muallif = muallif
    }
    if (janr) {
        find_id.janr = janr
    }
    if (nashrYili) {
        find_id.nashrYili = nashrYili
    }
    if (sahifalar) {
        find_id.sahifalar = sahifalar
    }
    if (holat) {
        find_id.holat = holat
    }

    await fs.writeFile("./kitoblar.json", JSON.stringify(data))
    resp.send({
        edited: "holat o'zgardi",
        old: old,
        new: find_id
    })
})


///////////////////////////////////////////////////// DELETE
server.delete("/kitoblar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./kitoblar.json", "utf-8"))
    let { id } = req.body
    let find_id = data.find(item => item.id === Number(id))
    if (!find_id) {
        resp.send({ error: "bunaqa id yo'q" })
        return
    }
    data = data.filter(item => item.id !== Number(id))
    await fs.writeFile("./kitoblar.json", JSON.stringify(data))
    resp.send({ deleted: find_id })
})


server.listen(4003, "127.0.0.1", () => {
    console.log("server on 4003 port");
})