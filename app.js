let crawlerController = require('./controllers/crawlerController2'),
    dbController = require('./controllers/dbController2');

  function  requestImage(url) {
      crawlerController.requestImages({'Url' : url}).then(imgs => {
      debugger;
      });
    }


function exec() {
crawlerController.processCrawl()
  .then((categories) => {
    dbController.exec(categories)
      .then(() => console.log("acabou"))
      .catch(e => console.log(e));
    }
  );
  }
function CrawlAndSave() {
  crawlerController.processCrawl().then((categories => {
        dbController.saveToFile(categories);
        let cats = JSON.parse(fs.readFileSync('data.json'));
       // dbController.exec(cats);

        }));
}
//CrawlAndSave();

let cats = JSON.parse(fs.readFileSync('data.json'));
dbController.exec(cats);

let cc = require('./controllers/crawlerController2');

function getCategoriesTest() {
  const INITIAL_URL = 'http://moveisareaexterna.com.br/produtos';
  cc.getDOM(INITIAL_URL)
    .then(html => cc.getCategories(html)
        .catch(e => console.log(e))
        .then(categories => console.log(categories))
        );
}
function getProductsTest() {
  let category = {
Name: 'Poltronas com Puff',
      Url: 'http://moveisareaexterna.com.br/produtos/poltronascompuff/74',
      Products: [] }
  cc.getProducts(category)
    .then(products => console.log(products))
    .catch(e => console.error(e));
}

function getImagesTest() {
  let product = {
Url: 'http://moveisareaexterna.com.br/produto/poltronalondrescompufftela/622',
     Title: 'Poltrona Londres com Puff (Tela)' }
  cc.getImages(product)
    .then(images => console.log(images))
    .catch(e => console.error(e));

}

function processCrawlTest() {
  cc.processCrawl();
}

//processCrawlTest();
