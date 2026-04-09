import { Link, useParams } from 'react-router-dom'
import { products, vendors } from '../data/mockData'

function ProductDetailsPage() {
  const { productId } = useParams()
  const product = products.find((item) => String(item.id) === productId) || products[0]
  const vendor = vendors.find((item) => item.id === product.vendorId)

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <section className="lumina-block product-details-layout">
          <img
            className="product-details-image"
            src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80"
            alt={product.name}
          />
          <div className="product-details-content">
            <p className="shop-item-brand">{vendor?.name}</p>
            <h2>{product.name}</h2>
            <p className="muted">
              Premium quality formula designed for daily beauty routine and skin
              health support.
            </p>
            <p className="price">EUR {product.price}</p>
            <div className="row-actions">
              <button className="btn-primary" type="button">
                Add to Cart
              </button>
              <Link className="btn-secondary" to={`/vendor/${product.vendorId}`}>
                View Vendor
              </Link>
            </div>
            <div className="vendor-side-box">
              <strong>Product details</strong>
              <p>Stock: {product.stock}</p>
              <p>Category: Beauty Product</p>
              <p>Delivery: 2-3 business days</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ProductDetailsPage
