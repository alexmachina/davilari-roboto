const mongoose = require('mongoose'),
      productModel = require('../models/products'),
      categoryModel = require('../models/categories');
      http = require('http'),
      short = require('shortid'),
      fs = require('fs');

class dbController {
  constructor() {
    mongoose.connect('mongodb://localhost/enterprise');
  }
  
  saveToFile(categories) {
    
    fs.writeFileSync('data.json', JSON.stringify(categories));
  }

  exec(categories) {
    categories.forEach(c => {
        let cmodel = new categoryModel(c);
        cmodel.save().then(() => {
            let actions = c.Products.map(p => this.saveProduct(cmodel, p));
            let results = Promise.all(actions);
            results.then(() => {
                console.log("Category: " + cmodel.name + " OK");
                });
            });
        });
  }

  saveProduct(cmodel, p) {
    return new Promise((resolve, reject) => {
        let product = new productModel();
        product.name = p.Title;
        product.category = cmodel._id;
        if (p.Images.length) {
        let actions = p.Images.map(i => this.downloadImage(i))
        let results = Promise.all(actions);
        results.then((images) => {
            product.images = images;
            product.mainImage = images[0];
            product.save().then(()=> {
                console.log("Saving product: " + product.name);
                })
            });
        } else {
          console.log("NO IMAGES");
        }

        resolve();
        });
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
         }
        ).on
        ('error', (err) => reject(err))
        .on
        ('finish', () => {
         resolve(path.split('/')[2])
         })
        }
        )
  }

}



module.exports = new dbController();
