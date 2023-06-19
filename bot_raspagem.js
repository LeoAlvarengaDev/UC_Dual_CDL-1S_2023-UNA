// Importação das bibliotecas necessárias
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fastcsv = require('fast-csv');
const fs = require('fs');

// Definição do número máximo de páginas a serem abertas
process.setMaxListeners(55);

async function bot_raspagem(busca, nomeArquivo) {
    // Array para armazenar os dados coletados durante a pesquisa
    let dados = [];

    // URL-alvo para realizar a raspagem
    const alvo = `https://www.google.com.br/maps/search/${busca}-Boa Viagem, Belo Horizonte - MG, 30130-180`;

    // Inicialização de uma instância do navegador
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage(); // Criação de uma nova página do navegador
    await page.goto(alvo, { timeout: 3000000 }); // Definição do tempo limite para carregamento da página
    let html = await page.content(); // Variável que recebe o conteúdo da página
    const $ = await cheerio.load(html); // Carregamento do conteúdo HTML para manipulação

    // Acessando a classe '.WNBkOb' para extrair os dados relevantes
    $('.WNBkOb').map((index, element) => {
        let horarios = $(element).find('.y0skZc').text();
        let nome = $(element).find('.fontHeadlineLarge').text();
        let endereco = $(element).find('.AeaXub').text();
        let avaliacao = $(element).find('.fontBodyMedium.dmRWX').text();
        let comentario = $(element).find('.jJc9Ad ').text();
        let tipo = $(element).find('.LBgpqf').text();
        let onibus = $(element).find('.JH7O1e').text();

        // Criação de um objeto para armazenar os dados coletados
        const dado = { nome, tipo, endereco, horarios, avaliacao, comentario, onibus };
        dados.push(dado); // Adicionando o objeto ao array 'dados'
    });

    // Criação do arquivo CSV
    const csvStream = fastcsv.format({ headers: true });
    const writableStream = fs.createWriteStream(nomeArquivo);

    // Escrevendo os dados no arquivo CSV
    dados.forEach((dado) => {
        csvStream.write(dado);
    });

    // Finalizando o arquivo CSV
    csvStream.pipe(writableStream);
    csvStream.end();
}

// Lista de nomes de estabelecimentos a serem pesquisados
let estabelecimentos = ['Bus Stop Av. João Pinheiro - 329'];
// Lista de nomes de arquivos para salvar os resultados
let nome_arquivos = ['Bus Stop Av. João Pinheiro - 329.csv'];

// Loop que percorre os campos e realiza a pesquisa para cada estabelecimento
for (let i = 0; i < estabelecimentos.length; i++) {
    bot_raspagem(estabelecimentos[i], nome_arquivos[i]);
}