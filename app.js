'use strict'

const examples = [
  {
    id: 'rayas',
    name: 'Camisa a rayas',
    category: 'Camisas',
    price: 38900,
    sizes: 'S, M, L, XL',
    color: 'Azul y arena',
    image: 'rayas',
    published: true
  },
  {
    id: 'crudo',
    name: 'Camisa de algodón',
    category: 'Camisas',
    price: 35900,
    sizes: 'S, M, L',
    color: 'Crudo',
    image: 'crudo',
    published: true
  },
  {
    id: 'bermuda',
    name: 'Bermuda sastrera',
    category: 'Bermudas',
    price: 28900,
    sizes: '38, 40, 42, 44',
    color: 'Negro',
    image: 'bermuda',
    published: true
  },
  {
    id: 'jean',
    name: 'Jean recto',
    category: 'Jeans',
    price: 46900,
    sizes: '36, 38, 40, 42, 44',
    color: 'Azul índigo',
    image: 'jean',
    published: true
  },
  {
    id: 'bolso',
    name: 'Bolso de cuero',
    category: 'Accesorios',
    price: 52900,
    sizes: 'Único',
    color: 'Suela',
    image: 'bolso',
    published: true
  },
  {
    id: 'oliva',
    name: 'Sobrecamisa oliva',
    category: 'Camisas',
    price: 48500,
    sizes: 'M, L, XL',
    color: 'Verde oliva',
    image: 'oliva',
    published: false
  }
]

const categories = ['Camisas', 'Bermudas', 'Jeans', 'Accesorios']
const images = [...examples]
const shopNumber = '5493413411828'
const catalogKey = 'laundry-catalog-demo-v1'

const money = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
})

const $ = id => document.getElementById(id)
const dialog = $('dialog')
const bag = []

let products = readCatalog()
let category = 'Todas'
let toastTimer

// Datos de la maqueta

function readCatalog () {
  try {
    const saved = JSON.parse(localStorage.getItem(catalogKey))
    if (Array.isArray(saved)) return saved
  } catch {}

  return examples.map(product => ({ ...product }))
}

function saveCatalog () {
  try {
    localStorage.setItem(catalogKey, JSON.stringify(products))
    return true
  } catch {
    return false
  }
}

function escapeHtml (value) {
  const entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }

  return String(value).replace(/[&<>"']/g, character => entities[character])
}

function photo (product) {
  const file =
    images.find(item => item.image === product.image)?.image ?? 'crudo'
  return 'assets/' + file + '.webp'
}

function productById (id) {
  return products.find(product => product.id === id)
}

function whatsapp (text) {
  return 'https://wa.me/' + shopNumber + '?text=' + encodeURIComponent(text)
}

function notify (message) {
  $('toast').textContent = message
  $('toast').hidden = false

  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    $('toast').hidden = true
  }, 3200)
}

// Navegación y catálogo

function route () {
  const admin = location.hash === '#panel'

  $('panel').hidden = !admin
  $('store').hidden = admin
  $('view-link').href = admin ? '#inicio' : '#panel'
  $('view-link').textContent = admin
    ? 'Volver a la tienda →'
    : 'Ver panel administrativo →'

  if (dialog.open) dialog.close()

  if (admin) {
    renderAdmin()
    window.scrollTo(0, 0)
  } else {
    renderStore()

    const destination = document.getElementById(location.hash.slice(1))

    if (!destination || destination.id === 'inicio') {
      window.scrollTo(0, 0)
    } else {
      destination.scrollIntoView()
    }
  }
}

function renderStore () {
  const live = products.filter(product => product.published)

  $('filters').innerHTML = ['Todas', ...categories]
    .map(
      item => `
        <button
          class="filter"
          data-action="filter"
          data-id="${item}"
          aria-pressed="${category === item}"
        >
          ${item}
        </button>
      `
    )
    .join('')

  const shown = live.filter(
    product => category === 'Todas' || product.category === category
  )

  $('result-count').textContent =
    shown.length + (shown.length === 1 ? ' producto' : ' productos')

  $('product-grid').innerHTML =
    shown
      .map(
        product => `
          <button class="product" data-action="detail" data-id="${escapeHtml(
            product.id
          )}">
            <figure>
              <img src="${photo(product)}" alt="" loading="lazy">
            </figure>
            <span class="product-info">
              <span>
                <small>${escapeHtml(product.category)}</small>
                <strong>${escapeHtml(product.name)}</strong>
              </span>
              <span class="price">${money.format(product.price)}</span>
            </span>
          </button>
        `
      )
      .join('') ||
    '<p class="empty">Todavía no hay productos en esta categoría.</p>'

  updateBagCount()
}

function renderAdmin () {
  const published = products.filter(product => product.published).length
  const stats = [
    ['Total de productos', products.length],
    ['Publicados', published],
    ['Borradores', products.length - published]
  ]

  $('stats').innerHTML = stats
    .map(
      ([label, number]) =>
        `<div class="stat"><strong>${number}</strong>${label}</div>`
    )
    .join('')

  const query = $('search').value.trim().toLocaleLowerCase('es')
  const status = $('status-filter').value
  const visible = products.filter(
    product =>
      product.name.toLocaleLowerCase('es').includes(query) &&
      (status === 'all' || product.published === (status === 'published'))
  )

  $('inventory-body').innerHTML =
    visible
      .map(
        product => `
          <tr>
            <td class="inventory-product">
              <div class="cell-product">
                <img class="thumb" src="${photo(product)}" alt="">
                ${escapeHtml(product.name)}
              </div>
            </td>
            <td>
              <span class="mobile-label">Categoría</span>
              ${escapeHtml(product.category)}
            </td>
            <td>
              <span class="mobile-label">Precio</span>
              ${money.format(product.price)}
            </td>
            <td class="inventory-status">
              <span class="mobile-label">Estado</span>
              <span class="status ${product.published ? 'live' : ''}">
                ${product.published ? 'Publicado' : 'Borrador'}
              </span>
            </td>
            <td class="inventory-actions">
              <button class="plain-link" data-action="edit" data-id="${escapeHtml(
                product.id
              )}">
                Editar
              </button>
              <button class="plain-link mobile-delete" data-action="delete" data-id="${escapeHtml(
                product.id
              )}">
                Eliminar
              </button>
            </td>
          </tr>
        `
      )
      .join('') ||
    '<tr class="inventory-empty"><td colspan="5" class="empty">No encontramos productos con esos filtros.</td></tr>'
}

// Ficha de producto y carrito

function showDialog (title, content) {
  $('dialog-content').innerHTML = `
    <div class="dialog-inner">
      <div class="dialog-head">
        <h2 id="dialog-title">${escapeHtml(title)}</h2>
        <button class="close" type="button" data-action="close" aria-label="Cerrar">×</button>
      </div>
      ${content}
    </div>
  `

  if (!dialog.open) dialog.showModal()
}

function showProduct (product) {
  if (!product?.published) return

  const sizes = product.sizes
    .split(',')
    .map(size => size.trim())
    .filter(Boolean)

  const options = sizes
    .map(size => `<option>${escapeHtml(size)}</option>`)
    .join('')
  const message =
    '¡Hola! Vi la maqueta de Laundry And Órbita y quería consultar por ' +
    product.name +
    '.'

  showDialog(
    product.name,
    `
      <img class="detail-photo" src="${photo(product)}" alt="${escapeHtml(
      product.name
    )}">
      <p><strong>${money.format(product.price)}</strong> · ${escapeHtml(
      product.color
    )}</p>

      <form id="selection-form" data-id="${escapeHtml(product.id)}">
        <div class="form-grid">
          <label>Talle<select name="size">${options}</select></label>
          <label>Cantidad<input name="qty" type="number" min="1" max="20" value="1" required></label>
        </div>
        <div class="dialog-actions">
          <button class="button primary" type="submit">Agregar a mi selección</button>
          <a class="button outline" href="${whatsapp(
            message
          )}" target="_blank" rel="noopener">
            Consultar por WhatsApp
          </a>
        </div>
      </form>
    `
  )
}

function updateBagCount () {
  $('bag-count').textContent = bag.reduce((sum, item) => sum + item.qty, 0)
}

function renderBag () {
  if (!bag.length) {
    showDialog(
      'Mi selección',
      '<p>Todavía no agregaste prendas a tu selección.</p><button class="button primary" data-action="close">Seguir mirando</button>'
    )
    return
  }

  const total = bag.reduce((sum, item) => sum + item.price * item.qty, 0)
  const message =
    '¡Hola! Estoy viendo la maqueta de Laundry And Órbita. Quisiera consultar por estas prendas:\n' +
    bag
      .map(
        item =>
          `- ${item.qty} × ${item.name} · ${item.color} · talle ${item.size}`
      )
      .join('\n')

  const lines = bag
    .map(
      (item, index) => `
        <div class="order-line">
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>Talle ${escapeHtml(item.size)} · ${escapeHtml(
        item.color
      )}</small>
          </div>
          <div class="quantity">
            <button data-action="less" data-id="${index}" aria-label="Quitar una unidad">−</button>
            ${item.qty}
            <button data-action="more" data-id="${index}" aria-label="Agregar una unidad" ${
        item.qty >= 20 ? 'disabled' : ''
      }>+</button>
          </div>
        </div>
      `
    )
    .join('')

  showDialog(
    'Mi selección',
    `
      ${lines}
      <p style="margin-top:12px"><strong>Total de referencia · ${money.format(
        total
      )}</strong></p>
      <p>El local confirma disponibilidad y coordina el pago y la entrega por WhatsApp.</p>
      <div class="dialog-actions">
        <a class="button primary" href="${whatsapp(
          message
        )}" target="_blank" rel="noopener">
          Enviar pedido por WhatsApp
        </a>
      </div>
    `
  )
}

// Formulario del panel administrativo

function showEditor (product) {
  const draft = product ?? {
    id: '',
    name: '',
    category: categories[0],
    price: '',
    sizes: '',
    color: '',
    image: 'crudo',
    published: false
  }

  const categoryOptions = categories
    .map(
      item =>
        `<option ${draft.category === item ? 'selected' : ''}>${item}</option>`
    )
    .join('')

  const photoOptions = images
    .map(
      item =>
        `<option value="${item.image}" ${
          draft.image === item.image ? 'selected' : ''
        }>${item.name}</option>`
    )
    .join('')

  showDialog(
    product ? 'Editar producto' : 'Nuevo producto',
    `
      <form id="product-form" data-id="${escapeHtml(draft.id)}">
        <div class="form-grid">
          <label class="full">
            Nombre
            <input name="name" required maxlength="65" value="${escapeHtml(
              draft.name
            )}">
          </label>
          <label>Categoría<select name="category">${categoryOptions}</select></label>
          <label>
            Precio en ARS
            <input name="price" type="number" min="1" max="100000000" required value="${
              draft.price
            }">
          </label>
          <label>
            Talles separados por comas
            <input name="sizes" required maxlength="70" value="${escapeHtml(
              draft.sizes
            )}" placeholder="S, M, L">
          </label>
          <label>
            Color
            <input name="color" required maxlength="40" value="${escapeHtml(
              draft.color
            )}">
          </label>
          <label>Foto de muestra<select name="image">${photoOptions}</select></label>
          <label>
            Estado
            <select name="status">
              <option value="draft">Borrador</option>
              <option value="published" ${
                draft.published ? 'selected' : ''
              }>Publicado</option>
            </select>
          </label>
        </div>
        <div class="dialog-actions">
          <button class="button primary" type="submit">Guardar producto</button>
          <button class="button outline" type="button" data-action="close">Cancelar</button>
          ${
            product
              ? `<button class="plain-link" type="button" data-action="delete" data-id="${escapeHtml(
                  draft.id
                )}">Eliminar producto</button>`
              : ''
          }
        </div>
      </form>
    `
  )
}

function refreshCatalog (message) {
  for (let index = bag.length - 1; index >= 0; index -= 1) {
    const item = bag[index]
    const product = productById(item.id)

    if (
      !product?.published ||
      !product.sizes
        .split(',')
        .map(size => size.trim())
        .includes(item.size)
    ) {
      bag.splice(index, 1)
    } else {
      Object.assign(item, product)
    }
  }

  const saved = saveCatalog()

  if (dialog.open) dialog.close()

  renderAdmin()
  renderStore()
  notify(saved ? message : message + ' Los cambios solo duran en esta pestaña.')
}

// Botones y formularios

document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-action]')
  if (!trigger) return

  const { action, id } = trigger.dataset

  switch (action) {
    case 'filter':
      category = id
      renderStore()
      ;[...$('filters').children]
        .find(button => button.dataset.id === id)
        ?.focus()
      break

    case 'detail':
      showProduct(productById(id))
      break

    case 'bag':
      renderBag()
      break

    case 'close':
      dialog.close()
      break

    case 'new':
      showEditor()
      break

    case 'edit':
      showEditor(productById(id))
      break

    case 'less':
    case 'more': {
      const item = bag[Number(id)]
      if (!item) break

      item.qty = Math.min(20, item.qty + (action === 'more' ? 1 : -1))
      if (item.qty === 0) bag.splice(Number(id), 1)

      updateBagCount()
      renderBag()
      break
    }

    case 'delete':
      if (!window.confirm('¿Eliminar este producto de la maqueta?')) break
      products = products.filter(product => product.id !== id)
      refreshCatalog('Producto eliminado')
      break

    case 'reset':
      if (!window.confirm('¿Restaurar los productos de ejemplo?')) break
      products = examples.map(product => ({ ...product }))
      refreshCatalog('Ejemplos restaurados')
      break
  }
})

document.addEventListener('submit', event => {
  const form = event.target
  if (form.id !== 'selection-form' && form.id !== 'product-form') return

  event.preventDefault()
  const data = new FormData(form)

  if (form.id === 'selection-form') {
    const product = productById(form.dataset.id)
    if (!product?.published) return

    const size = data.get('size')
    const qty = Number(data.get('qty'))
    const existing = bag.find(
      item => item.id === product.id && item.size === size
    )

    if (existing) {
      existing.qty = Math.min(20, existing.qty + qty)
    } else {
      bag.push({ ...product, size, qty })
    }

    updateBagCount()
    dialog.close()
    notify('Prenda agregada a tu selección.')
    return
  }

  const name = String(data.get('name')).trim()
  const sizes = String(data.get('sizes'))
    .split(',')
    .map(size => size.trim())
    .filter(Boolean)
    .join(', ')
  const color = String(data.get('color')).trim()

  if (!name || !sizes || !color) {
    notify('Completá el nombre, los talles y el color.')
    return
  }

  const id = form.dataset.id || 'producto-' + Date.now()
  const product = {
    id,
    name,
    sizes,
    color,
    price: Number(data.get('price')),
    category: data.get('category'),
    image: data.get('image'),
    published: data.get('status') === 'published'
  }

  const index = products.findIndex(item => item.id === id)

  if (index === -1) {
    products.push(product)
  } else {
    products[index] = product
  }

  $('search').value = ''
  $('status-filter').value = 'all'
  refreshCatalog('Producto guardado')
})

$('search').addEventListener('input', renderAdmin)
$('status-filter').addEventListener('change', renderAdmin)
window.addEventListener('hashchange', route)

route()
