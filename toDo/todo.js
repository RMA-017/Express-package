// Topshiriq-3: Todo List
// Talablar:
// 1. Vazifa modeli:
// ○ id (avtomatik)
// ○ sarlavha
// ○ tavsif
// ○ status (yangi, jarayonda, tugallangan)
// ○ muhimlik (past, o'rta, yuqori)
// ○ muddat (sana)
// ○ yaratilgan Vaqt

// 2. CRUD operatsiyalari:
// ○ Barcha vazifalarni ko'rish
// ○ Bitta vazifani ID bo'yicha ko'rish
// ○ Yangi vazifa qo'shish
// ○ Vazifani yangilash
// ○ Vazifani o'chirish

// 3. Qo'shimcha route'lar:
// ○ Status bo'yicha filtrlash: /api/vazifalar?status=tugallangan
// ○ Muhimlik bo'yicha filtrlash: /api/vazifalar?muhimlik=yuqori
// ○ Bugungi vazifalar: /api/vazifalar/bugun
// ○ Muddati o'tgan vazifalar: /api/vazifalar/kech-qolgan
// ○ Vazifa statusini o'zgartirish: PATCH /api/vazifalar/:id/status

// 4. Validatsiya:
// ○ Sarlavha bo'sh bo'lmasligi kerak
// ○ Status faqat belgilangan qiymatlardan biri bo'lishi kerak
// ○ Muddat bugungi sanadan kichik bo'lmasligi kerak

import express from "express"
import cors from "cors"
import { promises as fs } from "node:fs"

const server = express()
server.use(express.json())
server.use(cors())
server.listen(4002, "127.0.0.1", () => {
    console.log("server on: 4002 port");
})

//////////////////////////////////////////////// GET
server.get("/", async (req, resp) => {
    resp.send({ health: "super server" })
})

server.get("/vazifalar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./todos.json", "utf-8"))

    // ○ Status bo'yicha filtrlash: /api/vazifalar?status=tugallangan
    if (req.query.status) {
        data = data.filter(item => item.status === req.query.status)
    }
    // ○ Muhimlik bo'yicha filtrlash: /api/vazifalar?muhimlik=yuqori
    if (req.query.muhimlik) {
        data = data.filter(item => item.muhimlik === req.query.muhimlik)
    }
    resp.send(data)
})

server.get("/vazifalar/:rootName", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./todos.json", "utf-8"))
    if (typeof (req.params.rootName - 0)) {
        let url_id = Number(req.params.rootName)
        data = data.find(item => {
            return item.id === url_id
        })
    }
    if (req.params.rootName === "bugun") {
        let data = JSON.parse(await fs.readFile("./todos.json", "utf-8"))
        data = data.filter(item => {
            return item.yaratilganVaqt === today()
        })
        resp.send(data)
        return
    }
    resp.send(data)
})

function today() {
    let date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    return `${year}-${month}-${day}`
}

//////////////////////////////////////////////// POST
server.post("/vazifalar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./todos.json", "utf-8"))
    let { sarlavha, tavsif, status, muhimlik, muddat } = req.body
    let new_data = {
        id: data.length + 1,
        sarlavha,
        tavsif,
        status,
        muhimlik,
        muddat,
        yaratilganVaqt: today()
    }
    data.push(new_data)
    await fs.writeFile("./todos.json", JSON.stringify(data))
    resp.send(new_data)
})

//////////////////////////////////////////////// PATCH
server.patch("/vazifalar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./todos.json", "utf-8"))
    let { id, sarlavha, tavsif, status, muhimlik, muddat, yaratilganVaqt } = req.body
    let id_search = data.find(item => item.id === Number(id))

    if (sarlavha) {
        id_search.sarlavha = sarlavha
    }
    if (tavsif) {
        id_search.tavsif = tavsif
    }
    if (status) {
        id_search.status = status
    }
    if (muhimlik) {
        id_search.muhimlik = muhimlik
    }
    if (muddat) {
        id_search.muddat = muddat
    }
    if (yaratilganVaqt) {
        id_search.yaratilganVaqt = yaratilganVaqt
    }
    await fs.writeFile("./todos.json", JSON.stringify(data))
    resp.send(id_search)
})


//////////////////////////////////////////////// DELETE
server.delete("/vazifalar", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./todos.json", "utf-8"))
    let { id } = req.body
    let id_search = data.find(item => item.id === Number(id))
    if (!id_search) {
        resp.send({ error: "not id number" })
    }
    data = data.filter(item => item.id !== Number(id))
    await fs.writeFile("./todos.json", JSON.stringify(data))
    resp.send(id_search)
})