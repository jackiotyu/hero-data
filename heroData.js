const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
var pass = process.env.PASS;
var baseurl = process.env.BASEURL;
var Url = `mongodb://jack:${pass}@${baseurl}/?authsource=admin`;

// 连接数据库函数
var conn = function (url) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(
      url,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function (err, db) {
        if (err) reject(err);
        else resolve(db);
      }
    );
  });
};
// 数据转换数组
var toArray = function (data) {
  return new Promise((resolve, reject) => {
    data.toArray((err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

const checkDir = fs.existsSync('heroData');
console.log(checkDir);
if (!checkDir) {
  fs.mkdir(
    'heroData',
    {
      recursive: false,
    },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
}

// //连接数据库

const getData = async function (attribute) {
  const con = await conn(Url);
  const db = con.db('data');
  console.log('connect database');
  const col = db.collection('HeroData');
  const HeroList = await col.distinct('hero')
  console.log('now');
  try {
    for (const hero of HeroList) {
      let data = await toArray(
        col.find(
          { hero: hero, attribute: attribute },
          {
            projection: {
              _id: 0,
              hero: 0,
              attribute: 0,
              rarity: 0,
              camp: 0,
              qualitySort: 0,
            },
          }
        ).sort({ qualitySort: -1, season:-1 })
      );
      data = JSON.stringify(data);
      fs.writeFileSync(`./heroData/${hero}_${attribute}.json`, data, function (
        err,
        data
      ) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
};
const Task = async function () {
  try {
    console.log('task');

    await getData('weapon');
    await getData('armor')
      .then(() => {
        const date = new Date();
        fs.writeFileSync('./heroData/README.md', String(date), function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        });
      })
      .then(() => {
        process.exit(0);
      });
  } catch (error) {
    console.log(error);
    process.exit(0);
  }
};
console.log('start');
Task();
