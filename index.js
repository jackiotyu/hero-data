const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
var pass = process.env.PASS
var Url = `mongodb+srv://jack:${pass}@database-lnq44.azure.mongodb.net/test?retryWrites=true&w=majority`

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

const checkDir = fs.existsSync('heroData')
console.log(checkDir)
if (!checkDir) {
  fs.mkdir('heroData', {
    recursive: false
  }, (err) => {
    if (err) {
      console.log(err)
    }
  })
}

// //连接数据库

const getData = async function (attribute) {
  var con = await conn(Url)
  var db = con.db('ForHonorHero')
  console.log('connect database')
  var col = db.collection('HeroData')
  var updateCol = db.collection(attribute)
  const heroList = await col.distinct('hero')
  try {
    for (const hero of heroList) {
      var result = await toArray(col.find({ hero: hero, attribute: attribute }, { projection: { _id: 0, rarity: 0 } }).sort({ qualitySort: -1, season:-1 }))
      await updateCol.updateOne({ hero: hero }, { $set: { hero: hero, value: result } }, { upsert: true })
      console.log('更新：' + hero + ' ' + attribute)
    }
  } catch (error) {
    console.log(error)
  }
}
const Task = async function () {
  try {
    await getData('weapon')
    getData('armor').then(() => {
      process.exit(0)
    })
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
}
console.log('start')
Task()
