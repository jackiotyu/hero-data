require('dotenv').config()
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const Url = process.env.MONGO_URL;

// 连接数据库函数
var conn = function (url) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      function (err, db) {
        if (err) reject(err)
        else resolve(db)
      }
    )
  })
}
// 数据转换数组
var toArray = function (data) {
  return new Promise((resolve, reject) => {
    data.toArray((err, res) => {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

const checkDir = fs.existsSync('data')
console.log(checkDir)
if (!checkDir) {
  fs.mkdir('data', {
    recursive: false
  }, (err) => {
    if (err) {
      console.log(err)
    }
  })
}

// //连接数据库

const getData = async function (attribute) {
  const con = await conn(Url)
  const db = con.db('data')
  console.log('connect database')
  const col = db.collection('HeroData')
  try {

    let data = await toArray(col.find({attribute}, { projection: { _id: 0 } }))
    data = JSON.stringify(data)
    await fs.writeFileSync(`./data/${attribute}.json`, data, function (err, data) {
      if (err) {
        console.log(err, 'err')
      } else {
        console.log(data)
      }
    })
  } catch (error) {
    console.log(error)
  }
}
const Task = async function () {
  try {
    await getData('weapon')
    getData('armor').then(() => {
      const date = new Date()
      fs.writeFileSync('./data/README.md', date, function (err, data) {
        if (err) {
          console.log(err, 'err')
        } else {
          console.log(data)
        }
      })
    }).then(() => {
      process.exit(0)
    })
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
}
console.log('start')
Task()
