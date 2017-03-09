let mysql = require('mysql'),
conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'cthulhu1',
  database:'davilari',
  connectTimeout: 10E4
}),
mongoose = require('mongoose'),
fs = require('fs'),
http = require('http'),
short = require('shortid')

class dbController {

  constructor (connection) {
    this.connection = connection
    this.TEMP_IMG_FOLDER_NAME = 'img/'

    mongoose.connect('mongodb://localhost/davilari');
   }

  insertCategories(categories) {
    return new Promise((resolve, reject) => {
      this.connection.connect((err) => {
        if (err){
          debugger;
          reject(err)
        }
      })

      this.insertCategoryList(categories)
    })
  }

  insertCategoryList(categoryList) {
    return new Promise(
      (resolve, reject) => {

    categoryList.forEach( (category) => {
      console.log("Inserting category: ")
      this.insertCategory(category)
    })
    resolve()

  })

  }
  insertCategory(category) {
    return new Promise (
      (resolve, reject) => {
        console.log('Inserting %s ', category.Name);
        this.connection.query(
          `INSERT INTO Tb_Category(name) VALUES ('${category.Name}')
          `, (err, result) => {
            //debugger;
            if(err) reject(err)
            else
            category.Products.forEach((p) => {

              if (p.Images && p.Images.length > 0) {

              this.insertProduct(p, result.insertId).then((pId) => {

                  p.Images.forEach((i) => {
                    this.insertImage(i, pId).then(() => console.log("Image Inserted"))
                    .catch( err => console.log(err))
                })
            }).catch( err => console.log(err))
          } else {
            reject("NO Images")
          }
        })
            resolve()
          })
      })
   }

  insertProduct(product, cId) {
    return new Promise(
      (resolve, reject) => {
        console.log(product.Title)
        this.connection.query(`
          INSERT INTO Tb_Product(name) Values ('${product.Title}');
          `
          , (err, result) => {
            if (err) reject(err)
            else {
              this.connection.query(`INSERT INTO Tb_Product_Category(IdProduct, IdCategory)   VALUES(${result.insertId},${cId})`,
                function(err) {
                  if (err) { console.log(err) }
                    resolve(result.insertId)
                })
            }
          }
        )
      }
    )


   }
  insertImage(image, pId) {
    return new Promise(
      (resolve, reject) => {
        this.downloadImage(image).then((path) => {
          this.connection.query(`
            INSERT INTO Tb_Image(IdProduct, path) VALUES (${pId}, '${path}');


            `, (err) => {
              if (err) { reject(err) }
              else {

                this.connection.query(`UPDATE Tb_Product SET mainImage = '${path}' Where IdProduct = ${pId}`,
                  (err)=> {
                    if (err) reject(err)
                    else
                    { console.log("Updating main image %s from product %s", path, pId)
                      resolve() }
                  })
              }
            })
        }).catch( err => console.log(err))
      }
    )
   }

  downloadImage(imageUrl) {
    return new Promise (
      (resolve,reject) => {
      //  debugger;
        let path = 'img/products/'+short.generate(),
            file = fs.createWriteStream(path)
        http.get
          (imageUrl, (response) => {
          response.pipe(file)
          resolve(path.split('/')[2])
          }
        ).on
          ('error', (err) => reject(err))
         .on
          ('finish', () => {

          })
      }
    )
  }




}


module.exports = new dbController(conn)
