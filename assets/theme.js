/* Muttmore theme scripts — small, dependency-free, progressive.
   Every feature works without JS; this only makes it nicer. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Money ---------- */
  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    format = format || (window.Muttmore && window.Muttmore.moneyFormat) || '${{amount}}';
    var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
    if (!match) return format;

    function withDelimiters(number, precision, thousands, decimal) {
      if (isNaN(number) || number == null) return '0';
      var parts = (number / 100).toFixed(precision).split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      return dollars + (parts[1] ? decimal + parts[1] : '');
    }

    var value;
    switch (match[1]) {
      case 'amount_no_decimals': value = withDelimiters(cents, 0, ',', '.'); break;
      case 'amount_with_comma_separator': value = withDelimiters(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = withDelimiters(cents, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': value = withDelimiters(cents, 2, "'", '.'); break;
      default: value = withDelimiters(cents, 2, ',', '.');
    }
    return format.replace(match[0], value);
  }

  /* ---------- Sticky header shadow + mobile menu offset ---------- */
  function initHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      document.documentElement.style.setProperty('--menu-top', header.getBoundingClientRect().bottom + 'px');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    var drawer = header.querySelector('.menu-drawer');
    if (drawer) {
      drawer.addEventListener('toggle', function () {
        update();
        var summary = drawer.querySelector('summary');
        summary.setAttribute('aria-expanded', drawer.open ? 'true' : 'false');
        document.body.style.overflow = drawer.open ? 'hidden' : '';
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.open) {
          drawer.open = false;
          drawer.querySelector('summary').focus();
        }
      });
    }
  }

  /* Close <details> popovers (filters) when clicking outside or pressing Escape */
  function initDisclosures() {
    document.addEventListener('click', function (e) {
      document.querySelectorAll('details[data-close-outside][open]').forEach(function (d) {
        if (!d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('details[data-close-outside][open]').forEach(function (d) {
        d.open = false;
        var s = d.querySelector('summary');
        if (s) s.focus();
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal(root) {
    var items = (root || document).querySelectorAll('[data-reveal]:not(.is-visible)');
    if (!items.length) return;
    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Cart count + toast ---------- */
  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById('CartToast');
    if (!toast) return;
    toast.querySelector('[data-toast-text]').textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 4500);
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
      el.classList.remove('is-bumped');
      void el.offsetWidth;
      el.classList.add('is-bumped');
    });
    document.querySelectorAll('[data-cart-label]').forEach(function (el) {
      el.textContent = 'Cart, ' + count + (count === 1 ? ' item' : ' items');
    });
  }

  /* ---------- Product form ---------- */
  function ProductForm(root) {
    this.root = root;
    var dataEl = root.querySelector('[data-product-json]');
    if (!dataEl) return;
    this.product = JSON.parse(dataEl.textContent);
    this.form = root.querySelector('form[data-product-form]');
    if (!this.form) return;
    this.idInput = this.form.querySelector('input[name="id"]');
    this.button = this.form.querySelector('[data-add-button]');
    this.buttonText = this.form.querySelector('[data-add-text]');
    this.priceEl = root.querySelector('[data-price]');
    this.errorEl = root.querySelector('[data-form-error]');
    this.mainImg = root.querySelector('[data-main-image]');
    this.thumbs = root.querySelectorAll('[data-thumb]');

    root.addEventListener('change', this.onOptionChange.bind(this));
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.thumbs.forEach(function (btn) {
      btn.addEventListener('click', this.showMedia.bind(this, btn.dataset.mediaId));
    }, this);

    root.querySelectorAll('[data-qty]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('input');
        var next = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(btn.dataset.qty, 10));
        input.value = next;
      });
    });

    this.updateAvailability();
  }

  ProductForm.prototype.selectedOptions = function () {
    var values = [];
    this.root.querySelectorAll('[data-option-index]').forEach(function (fieldset) {
      var checked = fieldset.querySelector('input:checked');
      values[parseInt(fieldset.dataset.optionIndex, 10)] = checked ? checked.value : null;
    });
    return values;
  };

  ProductForm.prototype.onOptionChange = function (e) {
    if (!e.target.closest('[data-option-index]')) return;
    var fieldset = e.target.closest('[data-option-index]');
    var labelValue = fieldset.querySelector('[data-selected-value]');
    if (labelValue) labelValue.textContent = e.target.value;

    var selected = this.selectedOptions();
    var variant = this.product.variants.find(function (v) {
      return v.options.every(function (opt, i) { return opt === selected[i]; });
    });
    this.setVariant(variant);
    this.updateAvailability();
  };

  ProductForm.prototype.setVariant = function (variant) {
    this.variant = variant;
    if (this.errorEl) this.errorEl.hidden = true;

    if (!variant) {
      this.button.disabled = true;
      this.buttonText.textContent = 'Not available in that combo';
      return;
    }

    this.idInput.value = variant.id;
    this.button.disabled = !variant.available;
    this.buttonText.textContent = variant.available ? 'Add to cart' : 'Sold out for now';

    if (this.priceEl) {
      var html = '<span class="price__current">' + formatMoney(variant.price) + '</span>';
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        html = '<span class="visually-hidden">Sale price</span>' + html +
          '<span class="visually-hidden">Regular price</span><s class="price__compare">' + formatMoney(variant.compare_at_price) + '</s>' +
          '<span class="price__sale-tag">On sale</span>';
      }
      this.priceEl.innerHTML = html;
    }

    if (variant.featured_media) this.showMedia(String(variant.featured_media.id));

    if (window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('variant', variant.id);
      window.history.replaceState({}, '', url.toString());
    }
  };

  /* Mark option values that can't make an available variant with the other current picks */
  ProductForm.prototype.updateAvailability = function () {
    var selected = this.selectedOptions();
    var variants = this.product.variants;
    this.root.querySelectorAll('[data-option-index]').forEach(function (fieldset) {
      var index = parseInt(fieldset.dataset.optionIndex, 10);
      fieldset.querySelectorAll('input').forEach(function (input) {
        var ok = variants.some(function (v) {
          if (!v.available || v.options[index] !== input.value) return false;
          return v.options.every(function (opt, i) { return i === index || selected[i] == null || opt === selected[i]; });
        });
        input.classList.toggle('is-unavailable', !ok);
      });
    });
  };

  ProductForm.prototype.showMedia = function (mediaId) {
    var thumb = this.root.querySelector('[data-thumb][data-media-id="' + mediaId + '"]');
    if (!thumb || !this.mainImg) return;
    var img = this.mainImg;
    this.thumbs.forEach(function (t) { t.setAttribute('aria-current', t === thumb ? 'true' : 'false'); });
    if (img.dataset.mediaId === mediaId) return;

    var swap = function () {
      img.srcset = thumb.dataset.srcset;
      img.src = thumb.dataset.src;
      img.alt = thumb.dataset.alt || '';
      img.dataset.mediaId = mediaId;
      img.classList.remove('is-swapping');
    };
    if (reduceMotion.matches) { swap(); return; }
    img.classList.add('is-swapping');
    setTimeout(swap, 160);
  };

  ProductForm.prototype.onSubmit = function (e) {
    if (!window.fetch) return;
    e.preventDefault();
    var self = this;
    this.button.classList.add('is-loading');
    this.button.setAttribute('aria-busy', 'true');

    fetch(window.Muttmore.routes.cart_add_url + '.js', {
      method: 'POST',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: new FormData(this.form)
    })
      .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
      .then(function (result) {
        if (!result.ok) throw new Error(result.data.description || result.data.message || 'Something went sideways.');
        return fetch(window.Muttmore.routes.cart_url + '.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); });
      })
      .then(function (cart) {
        updateCartCount(cart.item_count);
        showToast('Good pick. It’s in your cart.');
      })
      .catch(function (err) {
        if (self.errorEl) {
          self.errorEl.querySelector('[data-error-text]').textContent = err.message;
          self.errorEl.hidden = false;
        }
      })
      .finally(function () {
        self.button.classList.remove('is-loading');
        self.button.removeAttribute('aria-busy');
      });
  };

  /* ---------- Product recommendations ("Pairs well with") ----------
     Tries the primary intent first (e.g. complementary), then the fallback (related). */
  function initRecommendations() {
    document.querySelectorAll('[data-recommendations]').forEach(function (el) {
      var section = el.closest('[data-recommendations-section]');
      if (!window.fetch) { section.hidden = true; return; }
      var urls = [el.dataset.url, el.dataset.fallbackUrl].filter(Boolean);

      function tryNext() {
        var url = urls.shift();
        if (!url) { section.hidden = true; return; }
        fetch(url)
          .then(function (r) { return r.text(); })
          .then(function (text) {
            var doc = new DOMParser().parseFromString(text, 'text/html');
            var fresh = doc.querySelector('[data-recommendations]');
            if (fresh && fresh.querySelector('[data-rec-item]')) {
              el.innerHTML = fresh.innerHTML;
              el.removeAttribute('aria-busy');
              initReveal(el);
            } else {
              tryNext();
            }
          })
          .catch(tryNext);
      }
      tryNext();
    });
  }

  /* ---------- Cart page quantity steppers ---------- */
  function initCartSteppers() {
    document.querySelectorAll('input[name="updates[]"]').forEach(function (input) {
      input.addEventListener('change', function () {
        var form = input.closest('form');
        if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });
    document.querySelectorAll('[data-cart-qty]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = btn.parentElement.querySelector('input');
        input.value = Math.max(0, (parseInt(input.value, 10) || 0) + parseInt(btn.dataset.cartQty, 10));
        var form = btn.closest('form');
        if (form) form.requestSubmit ? form.requestSubmit() : form.submit();
      });
    });
  }

  /* Sort select auto-submits (a submit button remains for no-JS) */
  function initSort() {
    document.querySelectorAll('[data-auto-submit]').forEach(function (select) {
      select.addEventListener('change', function () { select.form.submit(); });
    });
    document.querySelectorAll('[data-js-hide]').forEach(function (el) { el.hidden = true; });
  }

  function init() {
    initHeader();
    initDisclosures();
    initReveal();
    initSort();
    initCartSteppers();
    document.querySelectorAll('[data-product]').forEach(function (el) { new ProductForm(el); });
    initRecommendations();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* Theme editor: re-run when sections change */
  document.addEventListener('shopify:section:load', function (e) {
    initReveal(e.target);
    e.target.querySelectorAll('[data-product]').forEach(function (el) { new ProductForm(el); });
  });
})();
