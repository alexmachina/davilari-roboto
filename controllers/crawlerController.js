//Libs
var
    request = require('request'),
    cheerio = require('cheerio'),
    Iconv = require('iconv').Iconv,
    utf8 = require('utf8')

//Models
Imagem = require('../models/imagem'),
    Category = require('../models/category'),
    Product = require('../models/product')

function crawlerController() {
    //Vars
    url = 'http://moveisareaexterna.com.br/produtos'
    var self = this


    //Loads the page with initial contents.
    this.LoadFirstDOM = function(url) {
        return new Promise((resolve, reject) => {})
    }

    this.getProductImages = function(p) {
        return new Promise((resolve, reject) => {

            request.get(p.Url, (err, req, html) => {
                console.log("Getting images for product %s", p.Title)

                $ = cheerio.load(html, {
                    decodeEntities: true
                })
                let imagesNode = $('.cloudzoom-gallery'),
                    imagesArr = []

                imagesNode.each((i, n) => {
                    console.log("Getting %s image of %s", i + 1, imagesNode.length)
                    imagesArr.push(n.attribs['data-cloudzoom'].split('zoomImage:')[1].split(',')[0].trim().replace('\'', "").replace('\'', ""))


                })


                resolve(imagesArr)
            })
        })

    }

    this.getProductList = function(category) {

        return new Promise((resolve, reject) => {
            if (category.Name == 'Sofas') {
                request({
                    url: category.Url,
                    encoding: 'latin1'

                }, (err, response, html) => {

                    console.log("Getting products for category %s", category.Name)
                    let
                        $ = cheerio.load(html, {
                            decodeEntities: true
                        })
                    productList = $('.boxProd'),
                        arrProduct = []
                    productList.each((i, elem) => {

                        let
                            url = elem.attribs.onclick.split('=')[1].trim().replace("\'", '').replace("\'", ''),
                            name = $(elem).children('.product_name').text()

                        product = new Product(url, name)
                        arrProduct.push(product)


                    })

                    resolve(arrProduct)

                })
            } else {

            }
        })

    }

    this.getCategoryList = function() {
        return new Promise((resolve, reject) => {
                try {
                    request.get(url,
                        (error, response, html) => {
                            if (error) reject(error)
                            let $ = cheerio.load(html, {
                                decodeEntities: true
                            })

                            let anchorList = $('.sidebar .nav-vert .listactive li').find('a')
                            let arrCategory = []
                            let promises = []
                            let imagePromises = []
                            for (var i = 0; i < anchorList.length; i++) {

                                //Wrapa tudão num array de Promises, pra saber que terminou de
                                //Buscar a bindar a lista de produtos em cada catiguria
                                promises.push(new Promise((resolve, reject) => {
                                        var category = new Category(anchorList.get(i).attribs.title, anchorList.get(i).attribs.href)

                                        self.getProductList(category).then((productList) => {
                                                productList.forEach((p, i, arr) => {
                                                        imagePromises.push(new Promise(resolve, reject) => {
                                                                self.getProductImages(p).then((images) => {
                                                                    p.Images = images
                                                                    resolve()
                                                                })
                                                            }
                                                        })
                                                        Promise.all(imagePromises)
                                                        .then(() => {
                                                          resolve()
                                                        })
                                                })
                                        })
                                }))
                        }

                        Promise.all(promises)
                        .then(() => {
                            console.log("Crawler terminado. %s categorias.", arrCategory.length)
                            resolve(arrCategory)

                        })

                    })

            } catch (ex) {
                reject(ex)
            }
        })
}

this.LoadFirstDOM(url).then((html) => {
    let $ = cheerio.load(html, {
        decodeEntities: true
    })

    getCategoryList($).then((arrCategory) => {



    })



})
}

module.exports = new crawlerController()
