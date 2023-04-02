require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const Url = process.env.MONGO_URL;
const DIR_NAME = 'hero_data';

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
        console.log(err, 'err', Url)
        if (err) reject(err);
        else resolve(db);
      },
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

const checkDir = fs.existsSync(DIR_NAME);
console.log(checkDir);
if (!checkDir) {
  fs.mkdir(
    DIR_NAME,
    {
      recursive: false,
    },
    (err) => {
      if (err) {
        console.log(err);
      }
    },
  );
}

// //连接数据库

const getData = async function (attribute) {
  const con = await conn(Url);
  const db = con.db('data');
  console.log('connect database');
  const col = db.collection('HeroData');
  const HeroList = await col.distinct('hero');
  console.log('now');
  try {
    for (const hero of HeroList) {
      let data = await toArray(
        col
          .find(
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
            },
          )
          .sort({ qualitySort: -1, season: -1 }),
      );

      let oldUrlMap = {
        HeroImg: {
          oldUrl: 'https://cdn.jsdelivr.net/gh/jackiotyu/HeroImg',
          newUrl: 'https://heroimg.forhonor.link',
        },
        ImgCloud: {
          oldUrl: 'https://cdn.jsdelivr.net/gh/jackiotyu/ImgCloud',
          newUrl: 'https://imgcloud.forhonor.link',
        },
        unusedImg: {
          oldUrl: 'https://cdn.jsdelivr.net/gh/jackiotyu/unusedImg',
          newUrl: 'https://unusedImg.forhonor.link',
        },
      };

      let oldUrlKeys = Object.keys(oldUrlMap);

      data = data.map((item) => {
        let urlKey = oldUrlKeys.find((urlKey) => item.imgUrl.includes(oldUrlMap[urlKey].oldUrl));
        if (urlKey) {
          return { ...item, imgUrl: item.imgUrl.replace(oldUrlMap[urlKey].oldUrl, oldUrlMap[urlKey].newUrl) };
        }
        return item;
      });

      data = JSON.stringify(data);

      fs.writeFileSync(`./${DIR_NAME}/${hero}_${attribute}.json`, data, function (err, data) {
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
        fs.writeFileSync(`./${DIR_NAME}/README.md`, String(date), function (err, data) {
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
