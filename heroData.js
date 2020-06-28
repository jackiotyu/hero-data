const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
var pass = process.env.PASS;
var Url = `mongodb+srv://jack:${pass}@database-lnq44.azure.mongodb.net/test?retryWrites=true&w=majority`;

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

const HeroList = [
  'Aramusha',
  'Berserker',
  'Black Prior',
  'Centurion',
  'Conqueror',
  'Gladiator',
  'Highlander',
  'Hitokiri',
  'Jiang Jun',
  'Jormungandr',
  'Kensei',
  'Lawbringer',
  'Nobushi',
  'Nuxia',
  'Orochi',
  'Peacekeeper',
  'Raider',
  'Shaman',
  'Shaolin',
  'Shinobi',
  'Shugoki',
  'Tiandi',
  'Valkyrie',
  'Warden',
  'Warlord',
  'Zhanhu',
];

// //连接数据库

const getData = async function (attribute) {
  const con = await conn(Url);
  const db = con.db('ForHonorHero');
  console.log('connect database');
  const col = db.collection('HeroData');
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
        )
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
        fs.writeFileSync('./heroData/README.md', date, function (err, data) {
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
