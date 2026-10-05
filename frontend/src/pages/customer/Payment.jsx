import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import Button from '@/components/ui/Button';
import TextButton from '@/components/ui/TextButton';
import { useCart } from '@/features/cart/context/CartContext';
import {
  clearCheckoutSession,
  getCheckoutSession,
} from '@/features/checkout/checkoutSessionService';
import { createOrder, getOrder } from '@/features/order/orderService';
import { createMockPayment } from '@/features/payment/paymentService';
import { formatPrice } from '@/utils/formatPrice';

const PAYMENT_METHODS = [
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Scan the QR code using your preferred payment app.',
    icon: 'qr_code_2',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    description: 'Pay securely using your GoPay balance.',
    icon: 'account_balance_wallet',
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    description: 'Pay through BCA Virtual Account.',
    icon: 'account_balance',
  },
  {
    id: 'bni_va',
    name: 'BNI Virtual Account',
    description: 'Pay through BNI Virtual Account.',
    icon: 'account_balance',
  },
];

export default function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const existingOrder = orderId ? getOrder(orderId) : null;
  const checkoutSession = orderId ? null : getCheckoutSession();

  // Helper untuk menampilkan toast notification sementara
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (orderId) {
    if (!existingOrder) {
      return <OrderNotFound />;
    }
    return (
      <ExistingPayment order={existingOrder} showToast={showToast} toastMessage={toastMessage} />
    );
  }

  if (!checkoutSession && paymentStatus !== 'processing') {
    return <Navigate to="/checkout" replace />;
  }

  const totalItems = checkoutSession?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod);
  const isProcessing = paymentStatus === 'processing';

  const handlePay = async () => {
    if (!paymentMethod) {
      setErrorMsg('Please select a payment method first.');
      return;
    }

    setErrorMsg('');
    setPaymentStatus('processing');

    try {
      const order = createOrder({
        customer: checkoutSession.customer,
        items: checkoutSession.items,
        subtotal: checkoutSession.subtotal,
        shippingMethod: checkoutSession.shippingMethod,
        shipping: checkoutSession.shipping,
        total: checkoutSession.total,
        paymentMethod,
      });

      await createMockPayment({
        orderId: order.id,
        paymentMethod,
        amount: order.total,
      });

      clearCheckoutSession();
      clearCart();

      navigate(`/payment/${order.id}`, { replace: true });
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Unable to initialize payment. Please try again.',
      );
      setPaymentStatus('idle');
    }
  };

  return (
    <PaymentLayout
      title="COMPLETE YOUR PAYMENT"
      description="Your checkout is ready for payment. Select your preferred payment method to continue."
    >
      {errorMsg && <PaymentError message={errorMsg} />}

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="border-border-subtle bg-surface-container-lowest border">
            <PaymentHeader />

            <div className="p-5 md:p-7">
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => (
                  <PaymentMethod
                    key={method.id}
                    method={method}
                    selected={paymentMethod === method.id}
                    onSelect={() => {
                      setPaymentMethod(method.id);
                      setErrorMsg('');
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6 lg:col-span-5">
          <OrderSummary checkoutSession={checkoutSession} totalItems={totalItems} />

          <PaymentAction
            selectedMethod={selectedMethod}
            isProcessing={isProcessing}
            onPay={handlePay}
          />
        </aside>
      </div>
    </PaymentLayout>
  );
}

function ExistingPayment({ order, showToast, toastMessage }) {
  const selectedMethod = PAYMENT_METHODS.find((method) => method.id === order.paymentMethod);

  // Cek apakah order sudah dibayar atau masih pending
  const isPaid = order.status === 'paid' || order.paymentStatus === 'success';

  return (
    <PaymentLayout
      title={isPaid ? 'PAYMENT SUCCESS' : 'PAYMENT STATUS'}
      description={
        isPaid
          ? `Order ${order.id} has been successfully paid.`
          : `Order ${order.id} is ready for payment.`
      }
    >
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="border-tertiary-container bg-surface-container-lowest fixed right-6 bottom-6 z-50 flex items-center gap-3 border px-4 py-3 shadow-lg">
          <span className="material-symbols-outlined text-tertiary-container text-[20px]">
            check_circle
          </span>
          <p className="font-technical-data text-tertiary-container text-sm">{toastMessage}</p>
        </div>
      )}

      {isPaid ? (
        <PaymentSuccessView order={order} />
      ) : (
        <PaymentPending order={order} selectedMethod={selectedMethod} showToast={showToast} />
      )}
    </PaymentLayout>
  );
}

function PaymentSuccessView({ order }) {
  return (
    <div className="border-border-subtle bg-surface-container-lowest mx-auto mt-10 max-w-2xl border p-8 text-center">
      <div className="border-primary bg-surface-container-low text-tertiary-container mx-auto flex h-16 w-16 items-center justify-center border">
        <span className="material-symbols-outlined text-[32px]">check</span>
      </div>
      <h2 className="font-headline-lg-mobile md:font-headline-lg text-tertiary-container mt-4">
        PAYMENT COMPLETED SUCCESSFULLY
      </h2>
      <p className="font-body-md text-secondary mt-2">
        Thank you! Your payment for order{' '}
        <span className="text-tertiary-container font-bold">{order.id}</span> has been verified.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button as={Link} to="/account/orders" size="lg" variant="primary">
          VIEW ORDER HISTORY
        </Button>
        <Button as={Link} to="/products" size="lg" variant="secondary">
          CONTINUE SHOPPING
        </Button>
      </div>
    </div>
  );
}

function PaymentLayout({ title, description, children }) {
  return (
    <main className="bg-surface min-h-[100svh] pt-16 md:pt-18">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14">
        <header className="border-border-subtle border-b pb-8">
          <TextButton
            as={Link}
            to="/checkout"
            variant="muted"
            icon="arrow_back"
            iconPosition="left"
            animateIcon
            underline={false}
          >
            REVIEW CHECKOUT
          </TextButton>

          <h1 className="font-headline-lg-mobile text-tertiary-container md:font-headline-display mt-4">
            {title}
          </h1>

          <p className="font-input text-secondary mt-4 max-w-xl">{description}</p>
        </header>

        {children}
      </div>
    </main>
  );
}

function PaymentError({ message }) {
  return (
    <div className="border-error bg-surface-container-low mt-6 flex items-start gap-3 border p-4">
      <span className="material-symbols-outlined text-error shrink-0 text-[20px]">error</span>
      <div>
        <p className="font-label-caps text-error">PAYMENT ERROR</p>
        <p className="font-body-sm text-error mt-1">{message}</p>
      </div>
    </div>
  );
}

function PaymentHeader() {
  return (
    <div className="border-border-subtle border-b p-6 md:p-7">
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="font-label-caps text-tertiary-container/75 text-[12px] font-bold">
            MIDTRANS
          </p>
          <h2 className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg mt-2">
            PAYMENT METHOD
          </h2>
          <p className="font-technical-data text-tertiary-container mt-2 max-w-md">
            Select the payment method you want to use
          </p>
        </div>
        <span className="material-symbols-outlined text-tertiary-container hidden !text-[32px] sm:block">
          payments
        </span>
      </div>
    </div>
  );
}

function PaymentMethod({ method, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        'group w-full cursor-pointer border text-left transition-colors',
        selected
          ? 'border-tertiary-container bg-surface-container-low'
          : 'border-border-subtle hover:border-tertiary-container/50',
      ].join(' ')}
    >
      <div className="flex items-center gap-4 p-4 md:p-5">
        <span
          className={[
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
            selected ? 'border-tertiary-container' : 'border-border-subtle',
          ].join(' ')}
        >
          {selected && <span className="bg-tertiary-container h-2.5 w-2.5 rounded-full" />}
        </span>

        <span
          className={[
            'material-symbols-outlined shrink-0 transition-colors',
            selected
              ? 'text-tertiary-container'
              : 'text-secondary group-hover:text-tertiary-container',
          ].join(' ')}
        >
          {method.icon}
        </span>

        <span className="min-w-0 flex-1">
          <span className="font-label-caps text-tertiary-container block text-[12px] font-bold">
            {method.name}
          </span>
          <span className="font-technical-data text-secondary mt-1 block leading-relaxed">
            {method.description}
          </span>
        </span>

        <span
          className={[
            'material-symbols-outlined shrink-0 text-[20px] transition-opacity',
            selected ? 'text-tertiary-container opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          check
        </span>
      </div>
    </button>
  );
}

function OrderSummary({ checkoutSession, totalItems }) {
  if (!checkoutSession) return null;

  return (
    <section className="border-border-subtle bg-surface-container-lowest border">
      <div className="border-border-subtle border-b p-6 md:p-7">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-label-caps text-tertiary-container text-[12px] font-bold">
              ORDER SUMMARY
            </p>
            <p className="font-technical-data text-secondary mt-2">CHECKOUT REVIEW</p>
          </div>
          <span className="border-primary font-label-caps text-tertiary-container border px-3 py-1">
            {totalItems} ITEMS
          </span>
        </div>
      </div>

      <div className="p-6 md:p-7">
        <div className="space-y-3">
          <SummaryRow
            label={`TOTAL ITEMS ( ${totalItems} )`}
            value={formatPrice(checkoutSession?.subtotal ?? 0)}
          />
          <SummaryRow
            label={`SHIPPING — ${checkoutSession?.shipping?.label ?? ''}`}
            value={formatPrice(checkoutSession?.shipping?.price ?? 0)}
          />
        </div>

        <div className="border-border-subtle mt-7 border-t pt-5">
          <div className="flex items-end justify-between gap-4">
            <span className="font-technical-data text-tertiary-container font-bold">TOTAL</span>
            <span className="font-technical-data text-tertiary-container text-[15px] font-bold">
              {formatPrice(checkoutSession?.total ?? 0)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentAction({ selectedMethod, isProcessing, onPay }) {
  const isDisabled = !selectedMethod || isProcessing;

  return (
    <section className="border-border-subtle bg-surface-container-lowest border p-6 md:p-7">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-tertiary-container !text-[28px]">
          shield_card
        </span>
        <div>
          <p className="font-label-caps text-tertiary-container text-[12px] font-semibold">
            SECURE PAYMENT
          </p>
          <p className="font-technical-data text-secondary mt-1">
            {selectedMethod
              ? `You selected ${selectedMethod.name} payment.`
              : 'Select a payment method before continuing.'}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button
          type="button"
          size="full"
          onClick={onPay}
          disabled={isDisabled}
          icon={isProcessing ? 'progress_activity' : 'payments'}
          iconPosition="right"
        >
          {isProcessing
            ? 'PROCESSING...'
            : selectedMethod
              ? 'CONTINUE TO PAYMENT'
              : 'SELECT PAYMENT METHOD'}
        </Button>
      </div>

      <p className="font-technical-data text-secondary mt-4 text-center leading-relaxed">
        Secure payment powered by Midtrans.
      </p>
    </section>
  );
}

function PaymentPending({ order, selectedMethod, showToast }) {
  const totalItems = order.items.reduce((total, item) => total + item.quantity, 0);
  const isVa = order.paymentMethod?.includes('_va');
  const isQris = order.paymentMethod === 'qris';
  const sampleVaNumber = order.paymentDetails?.vaNumber ?? '8800123456789012';

  const [copied, setCopied] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);

  const handleCopyVa = () => {
    navigator.clipboard.writeText(sampleVaNumber);
    setCopied(true);
    showToast('Virtual account number copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* BAGIAN KIRI: Instruksi & Detail Utama */}
      <section className="lg:col-span-7">
        <div className="border-border-subtle bg-surface-container-lowest border">
          <div className="border-border-subtle flex flex-col gap-4 border-b p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div className="flex items-center gap-4">
              <span className="text-tertiary-container flex h-12 w-12 shrink-0 items-center justify-center">
                <span className="material-symbols-outlined !text-[36px]">schedule</span>
              </span>
              <div>
                <p className="font-technical-data text-secondary font-semibold">
                  WAITING FOR PAYMENT
                </p>
                <h2 className="font-headline-lg-mobile text-tertiary-container mt-1">
                  {selectedMethod?.name ?? 'Payment'}
                </h2>
              </div>
            </div>

            <PaymentTimer />
          </div>

          <div className="p-6 md:p-8">
            <p className="font-input text-secondary max-w-xl leading-relaxed">
              Complete your payment using the instructions below before the time runs out.
            </p>

            {/* VIRTUAL ACCOUNT BOX (Hanya muncul jika VA) */}
            {isVa && (
              <div className="border-border-subtle bg-surface-bright mt-8 border p-5">
                <p className="font-label-caps text-tertiary-container text-[12px]">
                  VIRTUAL ACCOUNT NUMBER
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="font-headline-lg-mobile text-tertiary-container tracking-wider">
                    {sampleVaNumber}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={copied ? 'check' : 'content_copy'}
                    iconPosition="left"
                    onClick={handleCopyVa}
                  >
                    {copied ? 'COPIED!' : 'COPY'}
                  </Button>
                </div>
              </div>
            )}

            {/* Jika QRIS, informasi di kiri berupa teks panduan singkat */}
            {isQris && (
              <div className="border-border-subtle bg-surface-bright mt-8 space-y-2 border p-5">
                <p className="font-label-caps text-tertiary-container text-[12px]">QRIS PAYMENT</p>
                <p className="font-input text-secondary">
                  Please scan the QR code displayed on the right side using your mobile banking or
                  e-wallet application to complete the payment.
                </p>
              </div>
            )}

            {/* ACCORDION / PANDUAN CARA BAYAR */}
            <div className="border-border-subtle mt-6 border">
              <button
                type="button"
                onClick={() => setShowInstruction(!showInstruction)}
                className="bg-surface-bright hover:bg-surface-container flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors"
              >
                <span className="font-label-caps text-tertiary-container text-[12px] font-semibold">
                  HOW TO PAY INSTRUCTIONS
                </span>
                <span className="material-symbols-outlined text-tertiary-container transition-transform">
                  {showInstruction ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {showInstruction && (
                <div className="border-border-subtle bg-surface-bright text-secondary font-technical-data space-y-2 border-t p-4 text-[13px]">
                  <p>1. Open your mobile banking app or e-wallet.</p>
                  <p>
                    2. Select menu <strong>Transfer / Payment</strong> &gt;{' '}
                    <strong>Virtual Account / QRIS</strong>.
                  </p>
                  <p>3. Enter the payment number or scan the provided code.</p>
                  <p>4. Verify details and complete your transaction.</p>
                </div>
              )}
            </div>

            <div className="border-border-subtle bg-surface-bright mt-6 border p-5">
              <PaymentInfoRow label="ORDER ID" value={order.id} />
              <div className="pt-4">
                <p className="font-label-caps text-tertiary-container text-[12px]">TOTAL AMOUNT</p>
                <p className="font-headline-lg-mobile text-tertiary-container mt-2">
                  {formatPrice(order.total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAGIAN KANAN (ASIDE): QR CODE (Jika QRIS) atau Ringkasan Next Step */}
      <aside className="flex flex-col gap-6 lg:col-span-5">
        {/* Jika metode QRIS, tampilkan kotak QR Code secara penuh di aside */}
        {isQris && (
          <div className="border-border-subtle bg-surface-container-lowest border p-6 text-center md:p-7">
            <p className="font-label-caps text-tertiary-container mb-4 text-[12px] font-bold">
              SCAN QR CODE TO PAY
            </p>
            <div className="border-border-subtle mx-auto inline-block border bg-white p-4">
              <div className="font-technical-data flex h-56 w-56 items-center justify-center bg-gray-100 text-xs text-gray-400">
                [ QRIS CODE IMAGE ]
              </div>
            </div>
            <p className="font-technical-data text-secondary mt-4">
              Supports GoPay, OVO, Dana, BCA Mobile, and other QRIS apps.
            </p>
          </div>
        )}

        {/* Kotak Next Step / Summary */}
        <div className="border-border-subtle bg-surface-container-lowest border p-6 md:p-7">
          <p className="font-label-caps text-tertiary-container">NEXT STEP</p>
          <h3 className="font-headline-lg-mobile text-tertiary-container mt-2">
            FINISH TRANSACTION
          </h3>
          <p className="font-input text-secondary mt-3 leading-relaxed">
            Once the payment is completed, your order status will automatically update. You can
            check your order history in your account.
          </p>

          <div className="border-border-subtle mt-6 border-t pt-5">
            <p className="font-label-caps text-tertiary-container text-[12px] font-semibold">
              ITEMS SUMMARY
            </p>
            <p className="font-technical-data text-secondary mt-1">
              {totalItems} items in this order
            </p>
          </div>

          <div className="mt-8">
            <Button
              as={Link}
              to="/account/orders"
              size="full"
              variant="secondary"
              icon="receipt_long"
            >
              VIEW ORDER HISTORY
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function PaymentTimer() {
  return (
    <div className="border-error/30 bg-surface-bright flex items-center gap-2 rounded-sm border px-4 py-2">
      <span className="material-symbols-outlined text-error text-[18px]">timer</span>
      <div>
        <p className="font-label-caps text-error text-[10px]">PAYMENT EXPIRES IN</p>
        <p className="font-technical-data text-error text-[13px] font-bold">23 : 59 : 59</p>
      </div>
    </div>
  );
}

function PaymentInfoRow({ label, value, icon }) {
  return (
    <div className="border-border-subtle flex items-center justify-between gap-4 border-b pb-4 last:border-b-0">
      <div>
        <p className="font-label-caps text-tertiary-container text-[12px] font-semibold">{label}</p>
        <p className="font-technical-data text-secondary mt-1">{value}</p>
      </div>
      {icon && (
        <span className="material-symbols-outlined text-tertiary-container shrink-0">{icon}</span>
      )}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="font-label-caps text-secondary">{label}</span>
      <span className="font-technical-data text-tertiary-container">{value}</span>
    </div>
  );
}

function OrderNotFound() {
  return (
    <main className="bg-surface px-margin-mobile flex min-h-[70vh] items-center justify-center">
      <div className="text-center">
        <p className="font-headline-lg-mobile text-tertiary-container md:font-headline-lg">
          ORDER NOT FOUND
        </p>
        <p className="font-body-md text-secondary mt-3 mb-4">
          This payment session is invalid or has expired.
        </p>
        <Button as={Link} to="/products" variant="secondary" icon="shopping_bag_speed" size="lg">
          CONTINUE SHOPPING
        </Button>
      </div>
    </main>
  );
}
