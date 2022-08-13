import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImageApiService from './js/image-pixaby-api';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
  goTopBtn: document.querySelector('.go-top'),
};
const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});
refs.form.addEventListener('submit', showGallery);
refs.loadMoreBtn.addEventListener('click', loadMore);
refs.goTopBtn.addEventListener('click', onTop);

refs.loadMoreBtn.classList.add('.is-hidden');

// Экземпляр класса
const newImageApiService = new ImageApiService();

async function showGallery(e) {
  e.preventDefault();
  refs.gallery.innerHTML = '';

  newImageApiService.value = e.currentTarget.elements.searchQuery.value.trim();
  newImageApiService.resetPage();

  if (newImageApiService.value === '') {
    return;
  }
  if (newImageApiService.value !== '') {
    try {
      const response = await newImageApiService.fetchFotoUrl();
      refs.loadMoreBtn.classList.remove('is-hidden');
      createImageElement(response);
    } catch (error) {
      console.log(error);
    }
  }
}

async function loadMore() {
  try {
    refs.loadMoreBtn.classList.add('is-hidden');
    const response = await newImageApiService.fetchFotoUrl();
    refs.loadMoreBtn.classList.remove('.is-hidden');
    createImageElement(response);
  } catch (error) {
    console.error(error);
  }
}

function onTop(e) {
  e.preventDefault();
  window.scrollTo(0, 0);
}

function createImageElement(images) {
  console.log(images);
  // console.log(newImageApiService.page);
  const imageArray = images.data.hits;
  console.log(newImageApiService.page * imageArray.length);
  console.log(images.data.totalHits);
  if (imageArray !== 0) {
    if (images.data.totalHits < newImageApiService.page * imageArray.length) {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.info(`We're sorry, but you've reached the end of search results.`);
    }
    const markup = imageArray
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => {
          return `<div class="photo-card"><a class="gallery__item" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
                <p class="info-item">
                <b><span>Likes:</span> ${likes}</b>
                </p>
                <p class="info-item">
                <b><span>Views:</span> ${views}</b>
                </p>
                <p class="info-item">
                <b><span>Comments:</span> ${comments}</b>
                </p>
                <p class="info-item">
                <b><span>Downloads:</span> ${downloads}</b>
                </p>
            </div>
            </a>
            </div>`;
        }
      )
      .join('');
    refs.gallery.insertAdjacentHTML('beforeend', markup);
    lightbox.refresh();
  } else {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again'
    );
  }
}
