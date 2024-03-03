const BASE_URL = "https://webdev.alphacamp.io"
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector('#paginator')
const showTypePanel = document.querySelector('#show-type-btn')

function renderMovieList(data) {
  // 判斷目前畫面顯示型態
  const showType = document.querySelector('#search-form .show-active').dataset.show

  let rawHTML = ''

  if (showType === 'card') {
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top" alt="movie poster">
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer text-body-secondary">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                  data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
              </div>
            </div>
          </div>
        </div>`
    })
  } else if (showType === 'list') {
    rawHTML += `<table class='table'>
    <tbody>`
    
    data.forEach((item) => {
      rawHTML += `<tr>
      <td>${item.title}</td>
      <td>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
      </td>
      </tr>`
    })

    rawHTML += `</tbody></table>`
  }

  dataPanel.innerHTML = rawHTML
}

axios.get(INDEX_URL).then((response) => {
  // Array(80)
  // for (const movie of response.data.results) {
  //   movies.push(movie)
  // }
  movies.push(...response.data.results) // 展開運算子好厲害
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
}).catch((err) => console.log(err))

function renderPaginator(amount) {
  const totalPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= totalPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = "release at: " + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)

  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmit(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // 第一種方法：迴圈
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 第二種方法：filter
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`Cannot find movies with keyword: ${keyword}`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

showTypePanel.addEventListener('click', function(e) {
  const btn = e.target
  const types = document.querySelectorAll('[data-show]')
  types.forEach((type) => {
    type.classList.remove('show-active')
    type.classList.remove('text-primary')
  })

  btn.classList.add('show-active')
  btn.classList.add('text-primary')

  renderMovieList(getMoviesByPage(1))
})