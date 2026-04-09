import { Link } from 'react-router-dom'
import { useState } from 'react'
import EmptyState from '../components/EmptyState'
import { cartItems, products, vendors } from '../data/mockData'

function CartPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const groupedByVendor = cartItems.reduce((acc, item) => {
    acc[item.vendorId] = acc[item.vendorId] || []
    acc[item.vendorId].push(item)
    return acc
  }, {})

  const handleCheckout = () => {
    setIsCheckingOut(true)
    window.setTimeout(() => setIsCheckingOut(false), 1200)
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Cart</h2>
              <p>Single checkout, backend splits orders by vendor.</p>
            </div>
            <Link className="btn-secondary" to="/shop">
              Continue shopping
            </Link>
          </div>

          {Object.keys(groupedByVendor).length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Browse products and add items to begin checkout."
            />
          ) : (
            <>
              <div className="lumina-service-list" style={{ marginTop: '14px' }}>
                {Object.entries(groupedByVendor).map(([vendorId, items]) => {
                  const vendor = vendors.find((entry) => entry.id === Number(vendorId))
                  return (
                    <article key={vendorId} className="vendor-side-box" style={{ background: '#fff' }}>
                      <strong>{vendor?.name}</strong>
                      {items.map((item) => {
                        const product = products.find((entry) => entry.id === item.productId)
                        const subtotal = (product?.price || 0) * item.quantity
                        return (
                          <div key={item.id} className="line-item">
                            <span>
                              {product?.name} x {item.quantity}
                            </span>
                            <strong>EUR {subtotal}</strong>
                          </div>
                        )
                      })}
                    </article>
                  )
                })}
              </div>

              <button
                className={`btn-primary full ${isCheckingOut ? 'btn-loading' : ''}`}
                type="button"
                style={{ marginTop: '14px' }}
                disabled={isCheckingOut}
                onClick={handleCheckout}
              >
                {isCheckingOut ? 'Processing checkout...' : 'Checkout all vendors'}
              </button>
            </>
          )}
        </section>
      </div>
    </section>
  )
}

export default CartPage
