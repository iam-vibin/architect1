import React, { useState } from 'react';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface EscrowPaymentModalProps {
  quote: {
    id: string;
    quoteNumber: string;
    professionalName: string;
    projectType: string;
    quoteAmount: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export default function EscrowPaymentModal({
  quote,
  isOpen,
  onClose,
  onPaymentSuccess,
}: EscrowPaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const depositAmount = quote.quoteAmount || 50000;
  const platformFee = Math.round(depositAmount * 0.02);
  const totalAmount = depositAmount + platformFee;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.payments.depositEscrow({
        quoteId: quote.id,
        amount: depositAmount,
        cardNumber: cardNumber.replace(/\D/g, '') || '4242424242424242',
        cardExpiry: expiry,
        cardCvc: cvc,
      });

      if (!res || !res.success) {
        setError(res?.error || 'Payment failed to process');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Payment network error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">ArchiFind Safe Escrow</h3>
              <p className="text-[11px] text-muted-foreground">Test Mode Payment Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Escrow Explanation */}
        <div className="my-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>
            Your payment is held safely in escrow. Funds will <strong>only</strong> be released to{' '}
            <span className="font-semibold">{quote.professionalName}</span> after you approve project milestones or completion.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-muted/40 p-3.5 rounded-xl space-y-1.5 text-xs mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quote Ref:</span>
            <span className="font-mono font-semibold text-foreground">{quote.quoteNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-medium text-foreground truncate max-w-[200px]">{quote.projectType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Escrow Amount:</span>
            <span className="font-semibold text-foreground">₹{depositAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform Fee (2%):</span>
            <span>₹{platformFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-border pt-1.5 flex justify-between font-bold text-foreground text-sm">
            <span>Total to Deposit:</span>
            <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-foreground text-base">Escrow Deposit Successful!</h4>
            <p className="text-xs text-muted-foreground">Funds are securely locked in escrow. Project is now active!</p>
          </div>
        ) : (
          <form onSubmit={handleDeposit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Card Number (Test Card)</label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="pl-9 h-10 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Expiry</label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="h-10 text-xs"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">CVC</label>
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  className="h-10 text-xs"
                  required
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              💳 Test Gateway Mode: Simulated card processing. No real charges will be made.
            </p>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-10 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {loading ? 'Securing Funds...' : `Deposit ₹${totalAmount.toLocaleString()}`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
