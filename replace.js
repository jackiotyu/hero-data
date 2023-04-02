require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
const Url = process.env.MONGO_URL;
const DIR_NAME = 'hero_data';

// 连接数据库函数
const conn = function (url) {
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
const toArray = function (data) {
    return new Promise((resolve, reject) => {
        data.toArray((err, res) => {
            if (err) reject(err);
            else resolve(res);
        });
    });
};

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

async function main () {
    const con = await conn(Url);
    const db = con.db('data');
    console.log('connect database');
    const col = db.collection('HeroData');
    const otherCol = db.collection('unusedImg');
    const HeroList = await col.distinct('hero');
    console.log('now');
    try {
        for (const hero of HeroList) {
            let data = await toArray(
                col.find({ hero })
            );
            for (item of data) {
                let useless = [/heroimg/, /imgcloud/, /unusedImg/].every(reg => !reg.test(item.imgUrl))
                if (useless) {
                    // thirdImgList.push(item);
                    let origin = await otherCol.findOne({ _id: item._id });
                    if(origin) {
                        col.updateOne({ _id: item._id }, { $set: { imgUrl: origin.imgUrl } })
                    } else {
                        console.log(item);
                    }
                }
            }
        }
        process.exit(0);
    } catch (error) {
        console.log(error);
    }
}

main();