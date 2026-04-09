import { Link } from 'react-router-dom'
import { products, vendors } from '../data/mockData'

function ShopPage() {
  const catalogItems = [
    {
      id: 's1',
      type: 'Service',
      name: 'Signature Hydrating Facial',
      brand: 'Glow Studio',
      price: 120,
      image:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'p1',
      type: 'Product',
      name: 'Purifying Face Wash',
      brand: 'Vita Naturals',
      price: 34,
      image:
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'p2',
      type: 'Product',
      name: 'Midnight Jasmine Eau',
      brand: 'Noir Fragrance',
      price: 85,
      image:
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 'p3',
      type: 'Product',
      name: 'Hyaluronic Acid Toner',
      brand: 'Aether',
      price: 30,
      image:
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1000&q=80',
    },
    {
      id: 's2',
      type: 'Service',
      name: 'Full Glam Makeup Application',
      brand: 'Artistry by Lane',
      price: 95,
      image:
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80',
    },
    ...products.slice(0, 1).map((product) => ({
      id: `p-${product.id}`,
      type: 'Product',
      name: product.name,
      brand: vendors.find((entry) => entry.id === product.vendorId)?.name || 'Vendor',
      price: product.price,
      image:
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
    })),
  ]

  return (
    <section className="shop-reference-page">
      <div className="section-wrap shop-shell">
        <header className="shop-header">
          <h1>Shop & Book Services</h1>
          <p>
            Discover our complete collection of premium beauty products and book
            professional services from top-rated vendors.
          </p>
        </header>

        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            <strong>Filters</strong>
            <button type="button">Clear all</button>
            <span>Showing 1-6 of 124 results</span>
          </div>
          <div className="shop-toolbar-right">
            <label htmlFor="sortBy">Sort by</label>
            <select id="sortBy">
              <option>Relevance</option>
              <option>Newest</option>
              <option>Price low-high</option>
              <option>Price high-low</option>
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <div className="filter-block">
              <h4>Category</h4>
              <ul>
                <li>All (143)</li>
                <li>Products (124)</li>
                <li>Services (19)</li>
                <li>Skincare (45)</li>
                <li>Makeup (32)</li>
              </ul>
            </div>
            <div className="filter-block">
              <h4>Price range</h4>
              <div className="range-row">
                <span>$4</span>
                <span>$100</span>
                <span>$200+</span>
              </div>
            </div>
            <div className="filter-block">
              <h4>Rating</h4>
              <ul>
                <li>★★★★★ & up</li>
                <li>★★★★☆ & up</li>
              </ul>
            </div>
            <div className="filter-block">
              <h4>Service booking filters</h4>
              <ul>
                <li>Within 5 miles</li>
                <li>Date</li>
                <li>Any Time</li>
                <li>Any Duration</li>
              </ul>
            </div>
          </aside>

          <div>
            <div className="shop-grid">
              {catalogItems.map((item) => (
                <article key={item.id} className="shop-item-card">
                  <img src={item.image} alt={item.name} />
                  <div className="shop-item-content">
                    <p className="shop-item-brand">{item.brand}</p>
                    <h3>{item.name}</h3>
                    <div className="shop-item-meta">
                      <strong>${item.price.toFixed(2)}</strong>
                      {item.type === 'Service' ? (
                        <Link to="/services/1">View service</Link>
                      ) : (
                        <Link to="/products/1">View product</Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="shop-pagination">
              <button type="button" className="active">
                1
              </button>
              <button type="button">2</button>
              <button type="button">3</button>
              <button type="button">...</button>
              <button type="button">11</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopPage
