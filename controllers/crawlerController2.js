let request = require('request'),
    cheerio = require('cheerio'),
    Imagem = require('../models/imagem'),
    Category = require('../models/category'),
    Product = require('../models/product');

class CrawlerController {

  requestProducts(category) {
    return new Promise((resolve, reject) => {
      var that = this;
      function try2Get() { 
        that.getDOM(category.Url).then(html => {
          category.Products = that.getProducts(html);
          if(category.Products.length) {
            console.log(category.Url + " OK!");
            let actions = category.Products.map(p => that.requestImages(p).then(i => p.Images = i));
            let results = Promise.all(actions);
            results.then(()=> resolve());
          } else {
            console.log("Trying again for: " + category.Url);
            try2Get();
          }
        }).catch(e => {
          console.log(e);
        })
      }
      try2Get();
    })
  }

  requestImages(product) {
    return new Promise((resolve, reject) => {
      var that = this;
      function try2Get() {
        that.getDOM(product.Url).then(html => {
          product.Images = that.getImages(html);
          if(product.Images.length) {
            console.log(product.Url + " OK!");
            resolve(product.Images);
          }
          else {
            console.log("Trying again for: " + product.Url);
            try2Get();
          }
        }).catch(e => console.log(e));
      }
      try2Get();
    })
  }

  getData(html) {
    return new Promise((resolve, reject) => {
      let categories = this.getCategories(html);
      console.log(categories.length);
      let  actions = categories.map(c => this.requestProducts(c));
      let results = Promise.all(actions);
      //Quando tiver pego os produtos.
      results.then(() => {
        console.log("Fim");
        resolve(categories);

      })

      results.catch(e => console.log(e));
    })
  }



  /*
     let categories = this.getCategories(html);
     let actions = categories.map(c => this.requestProducts(c).then(p => c.Products = p));
     let results = Promise.all(actions)
     results.then(
     (results => {
     results.forEach(products => {
     let actions = products.map(p => this.requestImages(p));
     let results = Promise.all(actions);
     results.then((images) => {})
     });
     });
     );

     });
     */

  processCrawl() {
    return new Promise((resolve, reject) => {
      const INITIAL_URL = 'http://moveisareaexterna.com.br/produtos';
      this.getDOM(INITIAL_URL).then(html => this.getData(html).then(d => resolve(d)))
    })
  }
  getCategories(html) {

    try {
      //Cheerio
      let $ = cheerio.load(html, {
        decodeEntities: true
      });
      //Define category array.
      let categories = [];
      //Extract categories links DOM
      let categoriesLinks = $('.sidebar .nav-vert .listactive li').find('a');
      //Traverse the links
      categoriesLinks.each((i, cl) => {
        //Push category to array.
        categories.push(new Category(
          cl.attribs.title, //Category Name.
          cl.attribs.href // Category URL.
        ));
      });
      return categories;
    } catch (e) {

      throw e;
    }

  }

  getProducts(html) {
    try {
      //Cheerio.
      let $ = cheerio.load(html, {
        decodeEntities: true
      }),
        productsLinks = $('.boxProd'),
        products = [];
      //Traverse the links and extract the product.
      productsLinks.each((i, elem) => {

        products.push(
          new Product(
            elem.attribs.onclick.split('=')[1].trim().replace("\'", '').replace("\'", ''),
            $(elem).children('.product_name').text()
          )
        );
      });


      return products;

    } catch (e) {
      throw e;
    }

  }
  getOneProduct($) {}
  getImages(html) {

    try {
      let $ = cheerio.load(html, {
        decodeEntities: true
      });
      let imagesLinks = $('.cloudzoom-gallery'),
        images = [];

      imagesLinks.each((i, n) => {
        images.push(n.attribs['data-cloudzoom'].split('zoomImage:')[1].split(',')[0].trim().replace('\'', "").replace('\'', ""))
      });


      return images;

    } catch (e) {
      throw e;
    }

  }
  getDOM(url) {
    return new Promise((resolve, reject) => {
      //Resolve HTML or Reject Error
      request.get({
        url: url,
        encoding: 'latin1'
      },
        (err, res, html) => !err ? resolve(html) : reject(err)
      )
    })
  }
}

module.exports = new CrawlerController();
