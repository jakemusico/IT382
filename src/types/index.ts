export type UserRole = 'admin' | 'client'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed'
export type PaymentMethod = 'COP' | 'COD' | 'GCASH'
export type PaymentStatus = 'unpaid' | 'paid' | 'verifying'

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_price: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  created_at: string
  updated_at: string
  users?: UserProfile
}

export interface Payment {
  id: string
  order_id: string
  method: PaymentMethod
  gcash_proof_url: string | null
  status: 'pending' | 'verified'
  created_at: string
  orders?: Order
}

export interface OrderWithPayment extends Order {
  payments?: Payment[]
}
