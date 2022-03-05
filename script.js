
//DOM-объекты элементов пользовательского интерфейса
const titleInput = document.getElementById('title-input');
const typeSelect = document.getElementById('type-select');
const searchButton = document.getElementById('search-button');
const statusOutput = document.getElementById('status-output');
const searchResultsContainer = document.getElementById('search-results-container')

// Входные данные для поиска
let type, title;

// API ключ
const apiKey = 'c4ea70ee'; 

// Асинхронная функция для получения информации 
async function getCinemaInfo(url) {
    const response = await fetch(url); 
    return await response.json();
}
  
// Переменная текущая страница результатов
let pageNumber = 1;

// Обработка события click по кнопке search-button
searchButton.addEventListener('click', async function() {

    // Отмена запроса на сервер в случае отсутствия title
    if (!titleInput.value) { 
        statusOutput.innerText= 'Empty title\n Please enter title';
        return;
    }
     
    // Отмена запроса в случае повторения входных данных title & type
    if (titleInput.value == title & typeSelect.value == type ) {
        statusOutput.innerText= 'Repeated title and type\n Please enter new ones';
        return;
    }

    // Отмена запроса в случае несоответствия title шаблону
    const regexp = /^[a-zA-Z][a-zA-Z0-9 :\-,.?!&]*$/;

    if (!regexp.test(titleInput.value)) {
        statusOutput.innerText= 'Mistake in title\nTitle only starts with letters, please enter valid one';
        return;
    }

    // Входные данные для поиска
    title = titleInput.value;
    titleInput.value = '';
    type = typeSelect.value;
    // Вывод поискового запросa
    statusOutput.innerText= `Search for ${type}\n "${title}"`;
    // Переменная носитель ответа с сервера
    pageNumber = 1;
    // Формирование адреса запроса
    const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${title}&type=${type}`;
    // Получение информации
    const results = await getCinemaInfo(url);

    if (results.Response == 'False') {
        statusOutput.innerText= `Too many results for "${title}"\nPlease enter more specific one `; 
        return;
    }

    // Получение верного ответа с сервера
    const searchResults = results.Search;  
    // Обработка результатов поиска
    processSearchResults(searchResults);  
}); 

// Обработка события прокрутки
document.addEventListener('scroll', async function() {

    const availScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const currentScroll = Math.ceil(window.pageYOffset);

    if(currentScroll >= 288 ) {
        statusOutput.classList.add('sticky')
    } else {
        statusOutput.classList.remove('sticky')
    }

    if(currentScroll >= availScrollHeight) {
        // Текущая страница с результатом поиска
        pageNumber += 1;
        // Формирование адреса запроса
        const url = `http://www.omdbapi.com/?apikey=${apiKey}&s=${title}&type=${type}&page=${pageNumber}`;

        // Получение информации
        const results = await getCinemaInfo(url);
           
        // Получение верного ответа с сервера
        const searchResults = results.Search;  

        // Обработка результатов поиска
        processSearchResults(searchResults);
    }
});

// Обработка результатов поиска
function processSearchResults(searchResults) {
    for (const cinemaInfo of searchResults) {
        // Деструктуризация объекта
        const { Poster, Title, Type, Year, imdbID } = cinemaInfo;

        // Создание новых HTML-элементов
        const cinemaCard = 
            `<div class="cinema-card" data-imdbid="${imdbID}">
                <img src="${Poster}" alt="Poster of ${Title}" class="poster">
                    <div class="info">
                        <p class="type">${Type}</p>
                            <h6 class="title">${Title}</h6>
                            <p class="year">${Year}</p>
                    </div>
            </div>`;

        // Вставка нового HTML-элементов
        searchResultsContainer.insertAdjacentHTML('beforeend', cinemaCard);            
    }
}

// Обработка события click по карточкам
searchResultsContainer.addEventListener('click', async function(event) {
    // Карточка фильма 
    const cinemaCard = event.target.closest('.cinema-card');
 
    if (cinemaCard) {
        // ID фильма
        const imdbID = cinemaCard.dataset.imdbid;
        // Формирование адреса запроса
        const url = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
        // Получение информации
        const cinemaInfo = await getCinemaInfo(url);
        console.log('cinemaInfo :>> ', cinemaInfo);

        //
        // Деструктуризация объекта
        const { Poster, Title, Type, Year, Genre, Actors, Plot } = cinemaInfo;

        // Создание новых HTML-элементов
        const cinemaFullCard = 
            `<div id="fixed-container">
                <div class="cinema-full-card">
                    <div class="poster-full-card">
                        <img src="${Poster}" alt="Poster of ${Title}" class="poster">
                    </div>
                    <div class="info">
                        <p class="type">${Type}</p>
                        <h6 class="title">${Title}</h6>
                        <h6 class="genre">${Genre}</h6>
                        <p class="year">${Year}</p>
                        <p class="actors">${Actors}</p>
                        <p class="plot">${Plot}</p>
                    </div>
                    <button>&times;</button>
                </div>
            </div>`;
        // Вставка нового HTML-элементов
        document.body.insertAdjacentHTML('beforeend', cinemaFullCard);
        // Обработка события закрытия карточки товара при нажатии на элемент "крестик" 
        document.querySelector('.cinema-full-card button').addEventListener('click', function() {
            document.querySelector('.cinema-full-card').remove();
        })

    }

})   


