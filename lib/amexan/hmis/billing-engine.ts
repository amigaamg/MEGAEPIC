// ═══════════════════════════════════════════════════════════════════════════════
// AMEXAN HMIS Constitution — Book XV: Billing Engine
// Every service automatically produces charges. Supports cash, insurance, corporate, M-Pesa.
// ═══════════════════════════════════════════════════════════════════════════════

export interface ChargeItem {
  id: string;
  code: string;
  name: string;
  category: ChargeCategory;
  departmentId: string;
  unitPrice: number;
  currency: string;
  isPackage: boolean;
  packageItems?: string[];
  insuranceCovered: boolean;
  insuranceCoveragePercent: number;
  requiresAuthorization: boolean;
  taxPercent: number;
  isActive: boolean;
}

export enum ChargeCategory {
  Consultation = 'consultation',
  Procedure = 'procedure',
  Surgery = 'surgery',
  Laboratory = 'laboratory',
  Imaging = 'imaging',
  Pharmacy = 'pharmacy',
  Ward = 'ward',
  ICU = 'icu',
  Theatre = 'theatre',
  Consumable = 'consumable',
  Admission = 'admission',
  Emergency = 'emergency',
  Physiotherapy = 'physiotherapy',
  Dental = 'dental',
  Optical = 'optical',
  Miscellaneous = 'miscellaneous',
}

export interface Invoice {
  id: string;
  patientId: string;
  encounterId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  insuranceClaimId?: string;
  insuranceApprovedAmount?: number;
  notes?: string;
  issuedAt: number;
  dueAt?: number;
  closedAt?: number;
}

export interface InvoiceItem {
  chargeCode: string;
  chargeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isInsuranceCovered: boolean;
  insuranceCoveredAmount: number;
  orderedAt?: number;
  performedAt?: number;
}

export enum InvoiceStatus {
  Draft = 'draft',
  Issued = 'issued',
  Partial = 'partial',
  Paid = 'paid',
  Overpaid = 'overpaid',
  Waived = 'waived',
  Cancelled = 'cancelled',
  InsurancePending = 'insurance_pending',
  InsuranceApproved = 'insurance_approved',
  InsurancePartial = 'insurance_partial',
  InsuranceDenied = 'insurance_denied',
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  receivedAt: number;
  receivedBy: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export enum PaymentMethod {
  Cash = 'cash',
  MPesa = 'mpesa',
  Card = 'card',
  BankTransfer = 'bank_transfer',
  Cheque = 'cheque',
  Insurance = 'insurance',
  Corporate = 'corporate',
  MobileBanking = 'mobile_banking',
  Voucher = 'voucher',
  Waiver = 'waiver',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Refunded = 'refunded',
  PartialRefund = 'partial_refund',
  Disputed = 'disputed',
}

export interface InsuranceClaim {
  id: string;
  invoiceId: string;
  provider: string;
  memberNumber: string;
  authorizationCode?: string;
  claimItems: InsuranceClaimItem[];
  totalAmount: number;
  approvedAmount?: number;
  status: InsuranceClaimStatus;
  submittedAt: number;
  acknowledgedAt?: number;
  approvedAt?: number;
  paidAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
}

export interface InsuranceClaimItem {
  chargeCode: string;
  chargeName: string;
  amount: number;
  approvedAmount?: number;
  isApproved: boolean;
  rejectionReason?: string;
}

export enum InsuranceClaimStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Acknowledged = 'acknowledged',
  UnderReview = 'under_review',
  Approved = 'approved',
  PartialApproved = 'partial_approved',
  Paid = 'paid',
  Rejected = 'rejected',
  Appealed = 'appealed',
}

export function calculateInvoiceTotal(items: InvoiceItem[], discountPercent: number = 0, taxPercent: number = 0): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * (taxPercent / 100);
  return { subtotal, discount, tax, total: taxableAmount + tax };
}

export function splitPayment(invoice: Invoice, amount: number, method: PaymentMethod, reference: string, receivedBy: string): Payment {
  return {
    id: `PAY-${Date.now().toString(36).toUpperCase()}`,
    invoiceId: invoice.id,
    amount,
    method,
    reference,
    status: PaymentStatus.Completed,
    receivedAt: Date.now(),
    receivedBy,
  };
}

export function applyPayment(invoice: Invoice, payment: Payment): Invoice {
  invoice.amountPaid += payment.amount;
  invoice.balance = invoice.total - invoice.amountPaid;
  if (invoice.balance <= 0) invoice.status = InvoiceStatus.Paid;
  else if (invoice.amountPaid > 0) invoice.status = InvoiceStatus.Partial;
  return invoice;
}
