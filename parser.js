const axios = require('axios');
const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let pagesNumber = 58; // ! needs to be found inside the function paginator
const domen = 'https://miris.store'
const baseLink = 'https://miris.store/ua/catalog/probniki_frantsuzskikh_dukhov_miris_3_ml/?PAGEN_1=';
let page = 1;
let parsingTimeout = 0;
let data = [];

const chosenParfums = ['№35774', '№337033', '№35243', '№33296', '№38723', '№649', '№9922', '№33297', '№41990', '№233285', '№18578', '№30116', '№23302', '№34403', '№134', '№32115', '№19305', '№26996', '№26839'];

function paginator() {
    function getProductCards() {
        const link = baseLink + page;

        axios.get(link)
            .catch((err) => {
                console.log(err);
            })
            .then(async response => {
                const currentPage = response.data;
                const dom = new JSDOM(currentPage); // Инициализация библиотеки jsdom для разбора полученных HTML-данных, как в браузере

                const prodPath = dom.window.document.getElementsByClassName('mb-4 catalog-section')[0].getElementsByClassName('product-item-small-card');

                const prodsLength = prodPath.length;

                for (let i = 0; i < prodsLength; i++) {

                    const prodTitle = prodPath[i].getElementsByClassName('product-item-title')[0].textContent.trim();
                    const prodCustomNumber = prodTitle.substring(prodTitle.search('MIRIS') + 5, prodTitle.indexOf(' (аромат')).trim();
                    const prodCustomNumber2 = prodTitle.substring(prodTitle.search('Premium') + 7, prodTitle.indexOf(' (аромат')).trim();
                    // console.log('prodCustomNumber2', prodCustomNumber2, chosenParfums.includes(prodCustomNumber2), prodTitle.search('Premium'));
                    if (
                        (prodTitle.indexOf('(аромат') !== -1 && chosenParfums.includes(prodCustomNumber))
                        ||
                        (prodTitle.indexOf('(аромат') !== -1 && chosenParfums.includes(prodCustomNumber2))
                    ) {

                        const prodImg = prodPath[i].getElementsByClassName('product-item-image-alternative')[0].getAttribute('style').trim();

                        const prodSmellsLike = prodTitle.substring(prodTitle.search('на') + 3, prodTitle.indexOf(') '));
                        const prodImgPath = 'https://miris.store' + prodImg.substring(prodImg.indexOf("('") + 2, prodImg.indexOf("')"));

                        const link = 'https://miris.store' + prodPath[i].getElementsByClassName('product-item-title')[0]?.querySelector('a').getAttribute('href').trim();

                        const pyramid = [];

                        await axios.get(link)
                            .catch(err => console.log(err))
                            .then(response => {
                                const currentPage = response.data;
                                const dom = new JSDOM(currentPage);

                                const path = dom.window.document.querySelectorAll('.product-item-detail-properties .product-item-detail-properties-item');

                                const topNotes = path[2].querySelector('.product-item-detail-properties-value').textContent.trim();
                                pyramid.push(topNotes);
                                const middleNotes = path[3].querySelector('.product-item-detail-properties-value').textContent.trim();
                                pyramid.push(middleNotes);
                                const baseNotes = path[4].querySelector('.product-item-detail-properties-value').textContent.trim();
                                pyramid.push(baseNotes);
                            });

                        // console.log(pyramid);

                        const prodInfo = {
                            customNumber: prodCustomNumber,
                            analog: prodSmellsLike,
                            img: prodImgPath,
                            link,
                            pyramid,
                        };
                        // console.log('prodInfo', prodInfo);

                        data.push(prodInfo);
                    }

                };

                if (page > pagesNumber) {
                    console.log('Парсинг завершён.');
                    // Запись результата в файл
                    fs.appendFileSync('./chosen-parfums.json', JSON.stringify(data), (err) => {
                        if (err) throw err;
                    });
                };
            });

        page++;
    };

    // let startTime = new Date();
    for (let i = page; i <= pagesNumber; i++) {
        console.log('page #', i)
        const getTimer = setTimeout(getProductCards, parsingTimeout);
        parsingTimeout += 5000;
    };
    // const endTime = new Date();
    // let totalExecutionTime = (endTime - startTime).toLocaleString();
    // console.log(totalExecutionTime);

    return;
};

paginator();