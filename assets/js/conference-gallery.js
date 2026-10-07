/* Conference pages: turn runs of Markdown images into a photo grid, and open
   any photo in a full-screen viewer with captions. */
(function () {
  'use strict';

  var story = document.querySelector('.conference-story');
  if (!story) return;

  /* A paragraph that holds only images (one per line in Markdown) becomes a grid. */
  function isPhotoParagraph(p) {
    var hasImage = false;
    for (var i = 0; i < p.childNodes.length; i++) {
      var node = p.childNodes[i];
      if (node.nodeType === 1 && node.tagName === 'IMG') {
        hasImage = true;
      } else if (node.nodeType === 1 && node.tagName === 'BR') {
        continue;
      } else if (node.nodeType !== 3 || node.textContent.trim() !== '') {
        return false;
      }
    }
    return hasImage;
  }

  function wrapInButton(img) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'conference-photo__open';
    button.setAttribute('aria-label', 'View photo' + (img.alt ? ': ' + img.alt : ''));
    img.parentNode.insertBefore(button, img);
    button.appendChild(img);
    /* .fit photos are zoomed out inside the box; fill the sides with a blurred copy */
    if (img.classList.contains('fit')) {
      button.classList.add('is-fit');
      button.style.setProperty('--photo-src', 'url("' + img.src + '")');
    }
    return button;
  }

  Array.prototype.forEach.call(story.querySelectorAll('p'), function (p) {
    if (!isPhotoParagraph(p)) return;
    var images = Array.prototype.slice.call(p.querySelectorAll('img'));
    var grid = document.createElement('div');
    grid.className = 'conference-photos conference-photos--' + Math.min(images.length, 3);
    images.forEach(function (img) {
      var figure = document.createElement('figure');
      figure.className = 'conference-photo';
      grid.appendChild(figure);
      figure.appendChild(img);
      wrapInButton(img);
      if (img.alt) {
        var caption = document.createElement('figcaption');
        caption.textContent = img.alt;
        figure.appendChild(caption);
      }
    });
    p.parentNode.replaceChild(grid, p);
  });

  /* Conference | travel columns: words on top, then the column's photos
     stacked in a box you scroll down. On desktop both boxes have the same
     height whatever the number of photos; on phones the photos just stack. */
  var columnsWrap = story.querySelector('.conference-columns');
  if (columnsWrap) {
    columnsWrap.classList.add('is-aligned');
    Array.prototype.forEach.call(columnsWrap.querySelectorAll('.conference-column'), function (column) {
      var text = document.createElement('div');
      text.className = 'conference-column__text';
      var scroller = document.createElement('div');
      scroller.className = 'conference-scroller';

      Array.prototype.slice.call(column.children).forEach(function (child) {
        if (!child.classList.contains('conference-photos')) {
          text.appendChild(child);
          return;
        }
        Array.prototype.slice.call(child.querySelectorAll('.conference-photo')).forEach(function (figure) {
          scroller.appendChild(figure);
        });
      });

      column.innerHTML = '';
      column.appendChild(text);
      column.appendChild(scroller);

      /* Drop the bottom fade once there is nothing more to scroll to */
      function updateEnd() {
        var atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
        scroller.classList.toggle('is-end', atEnd);
      }
      scroller.addEventListener('scroll', updateEnd, { passive: true });
      window.addEventListener('resize', updateEnd);
      Array.prototype.forEach.call(scroller.querySelectorAll('img'), function (img) {
        img.addEventListener('load', updateEnd);
      });
      updateEnd();
    });
  }

  var photos = Array.prototype.slice.call(document.querySelectorAll('.conference-photo img'));
  if (!photos.length) return;

  /* Viewer */
  var viewer = document.createElement('div');
  viewer.className = 'conference-viewer';
  viewer.setAttribute('role', 'dialog');
  viewer.setAttribute('aria-modal', 'true');
  viewer.setAttribute('aria-label', 'Photo viewer');
  viewer.hidden = true;
  viewer.innerHTML =
    '<button type="button" class="conference-viewer__close" aria-label="Close">×</button>' +
    '<button type="button" class="conference-viewer__nav conference-viewer__nav--prev" aria-label="Previous photo">‹</button>' +
    '<figure class="conference-viewer__figure">' +
      '<img class="conference-viewer__img" alt="">' +
      '<figcaption class="conference-viewer__caption">' +
        '<span class="conference-viewer__text"></span>' +
        '<span class="conference-viewer__count"></span>' +
      '</figcaption>' +
    '</figure>' +
    '<button type="button" class="conference-viewer__nav conference-viewer__nav--next" aria-label="Next photo">›</button>';
  document.body.appendChild(viewer);

  var viewerImg = viewer.querySelector('.conference-viewer__img');
  var viewerText = viewer.querySelector('.conference-viewer__text');
  var viewerCount = viewer.querySelector('.conference-viewer__count');
  var closeButton = viewer.querySelector('.conference-viewer__close');
  var current = 0;
  var lastFocus = null;

  if (photos.length < 2) viewer.classList.add('is-single');

  function show(index) {
    current = (index + photos.length) % photos.length;
    var img = photos[current];
    viewerImg.src = img.currentSrc || img.src;
    viewerImg.alt = img.alt;
    viewerText.textContent = img.alt;
    viewerCount.textContent = photos.length > 1 ? (current + 1) + ' / ' + photos.length : '';
    [current - 1, current + 1].forEach(function (i) {
      var neighbour = photos[(i + photos.length) % photos.length];
      new Image().src = neighbour.currentSrc || neighbour.src;
    });
  }

  function open(index) {
    lastFocus = document.activeElement;
    show(index);
    viewer.hidden = false;
    document.documentElement.classList.add('conference-viewer-open');
    closeButton.focus();
  }

  function close() {
    viewer.hidden = true;
    viewerImg.removeAttribute('src');
    document.documentElement.classList.remove('conference-viewer-open');
    if (lastFocus) lastFocus.focus();
  }

  photos.forEach(function (img, index) {
    img.parentNode.addEventListener('click', function () { open(index); });
  });

  closeButton.addEventListener('click', close);
  viewer.querySelector('.conference-viewer__nav--prev').addEventListener('click', function () { show(current - 1); });
  viewer.querySelector('.conference-viewer__nav--next').addEventListener('click', function () { show(current + 1); });

  viewer.addEventListener('click', function (event) {
    if (event.target === viewer || event.target.classList.contains('conference-viewer__figure')) close();
  });

  document.addEventListener('keydown', function (event) {
    if (viewer.hidden) return;
    if (event.key === 'Escape') close();
    else if (event.key === 'ArrowLeft') show(current - 1);
    else if (event.key === 'ArrowRight') show(current + 1);
    else if (event.key === 'Tab') {
      /* Keep focus inside the viewer */
      var buttons = Array.prototype.filter.call(viewer.querySelectorAll('button'), function (b) {
        return b.offsetParent !== null;
      });
      var first = buttons[0];
      var last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
      else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
    }
  });

  var touchX = null;
  viewer.addEventListener('touchstart', function (event) {
    touchX = event.touches.length === 1 ? event.touches[0].clientX : null;
  }, { passive: true });
  viewer.addEventListener('touchend', function (event) {
    if (touchX === null || photos.length < 2) return;
    var dx = event.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
    touchX = null;
  }, { passive: true });
})();
