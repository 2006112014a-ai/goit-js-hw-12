import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';

import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

const form = document.querySelector('.form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const PER_PAGE = 15;

let page = 1;
let searchQuery = '';
let totalHits = 0;

// Новий пошук
form.addEventListener('submit', handleSearch);

// Завантаження наступної сторінки (ТЕПЕР НАЗВА ЗБІГАЄТЬСЯ З ФУНКЦІЄЮ НИЖЧЕ)
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();

  searchQuery = form.elements['search-text'].value.trim();

  if (!searchQuery) {
    return;
  }

  page = 1;
  totalHits = 0;

  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, page);

    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (page * PER_PAGE >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }

    form.reset();
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again!',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}

// ТЕПЕР ЦЕЙ БЛОК ПРАВИЛЬНО ОБ'ЄДНАНО В ОДНУ ФУНКЦІЮ ДЛЯ КНОПКИ
async function handleLoadMore() {
  page += 1;
  showLoader();
  hideLoadMoreButton(); // Ховаємо кнопку на час завантаження

  try {
    const data = await getImagesByQuery(searchQuery, page);

    // Додаємо нові картки до галереї
    createGallery(data.hits);

    // Перевірка на кінець результатів
    if (page * PER_PAGE >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }

    // Автоматичний плавний скрол на дві висоти картки вниз
    if (gallery.firstElementChild) {
      const { height: cardHeight } =
        gallery.firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    page -= 1;
    iziToast.error({
      message: 'Something went wrong. Please try again!',
      position: 'topRight',
    });
    showLoadMoreButton();
  } finally {
    hideLoader();
  }
}
