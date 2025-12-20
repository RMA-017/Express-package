// Topshiriq-2: Do'koni API
// Talablar:

// 1. Mahsulot modeli:
// ○ id (avtomatik)
// ○ nomi
// ○ narx
// ○ kategoriya (elektronika, kiyim, oziq-ovqat, va h.k.)
// ○ miqdor (omborda qancha bor)
// ○ tavsif

// 2. CRUD operatsiyalari:
// ○ Barcha mahsulotlarni ko'rish
// ○ Bitta mahsulotni ID bo'yicha ko'rish
// ○ Yangi mahsulot qo'shish
// ○ Mahsulot ma'lumotlarini yangilash
// ○ Mahsulotni o'chirish

// 3. Qo'shimcha route'lar:
// ○ Kategoriya bo'yicha filtrlash: // /api/mahsulotlar?kategoriya=elektronika
// ○ Narx oralig'i bo'yicha qidirish: // /api/mahsulotlar?minNarx=1000&maxNarx=5000
// ○ Omborda tugagan mahsulotlar: /api/mahsulotlar/tugagan
// ○ Eng qimmat 5 ta mahsulot: /api/mahsulotlar/eng-qimmat

// 4. Validatsiya:
// ○ Nomi kamida 3 ta belgidan iborat bo'lishi kerak
// ○ Narx 0 dan katta bo'lishi kerak
// ○ Miqdor 0 yoki undan katta bo'lishi kerak
// ○ Kategoriya ro'yxatdan birini tanlash

import express from "express"
import { promises as fs } from "fs"
import cors from "cors"

const server = express()
server.use(express.json())
server.use(cors())
server.listen(4001, "127.0.0.1", () => {
    console.log(`server on: 4001 port`);
})

////////////////////////////////////////////////////////// GET
server.get("/", async (res, resp) => {
    resp.send({ health: "super server" })
})

server.get("/magazine", async (req, resp) => {

    let data = JSON.parse(await fs.readFile("./magazine.json", "utf8"))

    //Narx oralig'i bo'yicha qidirish: // /api/mahsulotlar?minNarx=1000&maxNarx=5000
    if (req.query.minNarx && req.query.maxNarx) {
        let min = req.query.minNarx
        let max = req.query.maxNarx
        data = data.filter(item => {
            return min <= item.narx && item.narx <= max;
        })
    }

    // ○ Kategoriya bo'yicha filtrlash: // /api/mahsulotlar?kategoriya=elektronika
    if (req.query.kategoriya) {
        data = data.filter(item => item.kategoriya === req.query.kategoriya)
    }
    resp.send(data)
})

server.get("/magazine/:id", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./magazine.json", "utf-8"))
    let id_data = data.find(item => {
        return item.id === Number(req.params.id)
    })
    if (!id_data) {
        resp.send({ error: `bunaqa id mavjud emas` })
        return
    }
    resp.send({ search: id_data })
})

server.get("/eng-qimmat", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./magazine.json", "utf-8"))
    let top5 = [...data].sort((a, b) => b.narx - a.narx).splice(0, 5)
    resp.send(top5)
})

////////////////////////////////////////////////////////// POST
server.post("/magazine", async (req, resp) => {
    let data = JSON.parse(await fs.readFile("./magazine.json", "utf-8"))
    let { nomi, narx, kategoriya, miqdor, tavsif } = req.body
    let new_id = {
        id: data.length + 1,
        nomi,
        narx,
        kategoriya,
        miqdor,
        tavsif
    }
    data.push(new_id)
    await fs.writeFile("./magazine.json", JSON.stringify(data))
    resp.send(new_id)
})
////////////////////////////////////////////////////////// PATCH
server.patch("/magazine", async (req, resp) => {
    let { id, nomi, narx, kategoriya, miqdor, tavsif } = req.body
    let data = JSON.parse(await fs.readFile("./magazine.json", "utf-8"))
    let find_id = data.find(item => {
        return item.id === Number(id)
    })
    if (!find_id) {
        resp.json({ error: `bunaqa id mavjud emas` })
        return
    }
    if (nomi) {
        find_id.nomi = nomi
    }
    if (narx) {
        find_id.narx = narx
    }
    if (kategoriya) {
        find_id.kategoriya = kategoriya
    }
    if (miqdor) {
        find_id.miqdor = miqdor
    }
    if (tavsif) {
        find_id.tavsif = tavsif
    }
    await fs.writeFile("./magazine.json", JSON.stringify(data))
    resp.send(find_id)
})


////////////////////////////////////////////////////////// DELETE
server.delete("/magazine", async (req, resp) => {
    let { id } = req.body
    let data = JSON.parse(await fs.readFile("./magazine.json", "utf-8"))
    let find_id = data.find(item => {
        return item.id === Number(id)
    })
    if (!find_id) {
        resp.json({ error: `bunaqa id mavjud emas` })
        return
    }
    let new_data = data.filter(item => {
        return item.id !== Number(id)
    })
    await fs.writeFile("./magazine.json", JSON.stringify(new_data))
    resp.send({ deleted: find_id })
})

