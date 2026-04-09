export const categories = ['Hair', 'Nails', 'Spa', 'Barber', 'Skincare']

export const vendors = [
  {
    id: 1,
    name: 'Glow Beauty Studio',
    category: 'Beauty',
    rating: 4.9,
    city: 'Catanzaro',
    address: 'Via Roma 45',
    logo: 'GB',
    featured: true,
  },
  {
    id: 2,
    name: 'Elite Barber House',
    category: 'Barber',
    rating: 4.8,
    city: 'Lamezia Terme',
    address: 'Corso Numistrano 18',
    logo: 'EB',
    featured: true,
  },
  {
    id: 3,
    name: 'Lotus Spa Center',
    category: 'Spa',
    rating: 4.7,
    city: 'Cosenza',
    address: 'Via Panebianco 88',
    logo: 'LS',
    featured: false,
  },
]

export const services = [
  { id: 1, vendorId: 1, name: 'Facial Premium', price: 45, duration: 60 },
  { id: 2, vendorId: 1, name: 'Manicure Gel', price: 28, duration: 45 },
  { id: 3, vendorId: 2, name: 'Haircut + Beard', price: 30, duration: 45 },
  { id: 4, vendorId: 2, name: 'Beard Styling', price: 18, duration: 25 },
  { id: 5, vendorId: 3, name: 'Relax Massage', price: 60, duration: 60 },
]

export const products = [
  { id: 1, vendorId: 1, name: 'Hydra Serum', price: 29, stock: 30, image: 'SER' },
  { id: 2, vendorId: 2, name: 'Beard Oil', price: 16, stock: 50, image: 'OIL' },
  { id: 3, vendorId: 3, name: 'Spa Candle', price: 22, stock: 24, image: 'CAN' },
  { id: 4, vendorId: 1, name: 'Nail Gel Kit', price: 35, stock: 14, image: 'GEL' },
  { id: 5, vendorId: 2, name: 'Hair Wax Matte', price: 14, stock: 46, image: 'WAX' },
]

export const bookings = [
  {
    id: 1,
    vendorId: 2,
    serviceId: 3,
    dateTime: '2026-04-12 15:00',
    status: 'Confirmed',
  },
]

export const cartItems = [
  { id: 1, vendorId: 1, productId: 1, quantity: 1 },
  { id: 2, vendorId: 2, productId: 2, quantity: 2 },
]
