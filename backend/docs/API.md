# Beauty Marketplace API (V1)

Base URL: `/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (sanctum)
- `POST /auth/logout` (sanctum)

## Public Discovery
- `GET /vendors`
- `GET /vendors/{vendor}`
- `GET /products`
- `GET /products/{product}`
- `GET /services`
- `GET /services/{service}`
- `GET /reviews`

## Customer/Vendor
- `POST /products` (sanctum)
- `PUT /products/{product}` (sanctum)
- `POST /services` (sanctum)
- `PUT /services/{service}` (sanctum)
- `GET /bookings` (sanctum)
- `POST /bookings` (sanctum)
- `PATCH /bookings/{booking}/status/{status}` (sanctum)
- `GET /cart` (sanctum)
- `POST /cart/items` (sanctum)
- `POST /checkout` (sanctum, single checkout -> split vendor orders)
- `POST /reviews` (sanctum)

## Admin
- `PATCH /admin/vendors/{vendor}/approve` (sanctum + admin role)
- `PATCH /admin/vendors/{vendor}/reject` (sanctum + admin role)
- `PATCH /admin/vendors/{vendor}/ban` (sanctum + admin role)
- `GET /admin/orders` (sanctum + admin role)
- `GET /admin/bookings` (sanctum + admin role)
- `GET /admin/snapshot` (sanctum + admin role)
- `GET /admin/analytics` (sanctum + admin role)

## Response Shape
All endpoints return:
- `success`: boolean
- `message`: string
- `data`: mixed
- `meta`: object
- `errors`: mixed|null
