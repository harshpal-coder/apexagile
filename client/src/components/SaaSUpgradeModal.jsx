import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Sparkles, Check, Info } from 'lucide-react';
import { useSaaSStore } from '../context/useSaaSStore';
import confetti from 'canvas-confetti';

export default function SaaSUpgradeModal() {
  const { upgradeModalOpen, targetTier, limitDetails, closeUpgradeModal, upgradeSubscription, loading } = useSaaSStore();

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Auto-clear states on reopen
  useEffect(() => {
    if (upgradeModalOpen) {
      setCardHolder('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setIsFlipped(false);
      setPaymentSuccess(false);
      setFormError('');
    }
  }, [upgradeModalOpen]);

  // Brand detection based on first digit
  const getCardBrand = () => {
    if (cardNumber.startsWith('4')) return 'visa';
    if (cardNumber.startsWith('5')) return 'mastercard';
    return 'generic';
  };

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const limitedVal = rawVal.substring(0, 16);
    const parts = [];
    for (let i = 0; i < limitedVal.length; i += 4) {
      parts.push(limitedVal.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Expiry Date (adds '/' after 2 digits)
  const handleExpiryChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const limitedVal = rawVal.substring(0, 4);
    if (limitedVal.length >= 3) {
      setExpiry(`${limitedVal.substring(0, 2)}/${limitedVal.substring(2, 4)}`);
    } else {
      setExpiry(limitedVal);
    }
  };

  // CVV digits capping
  const handleCvvChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setCvv(rawVal.substring(0, 3));
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setFormError('');

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setFormError('Please enter card expiry date.');
      return;
    }
    if (cvv.length < 3) {
      setFormError('Please enter CVV.');
      return;
    }
    if (!cardHolder.trim()) {
      setFormError('Please enter cardholder name.');
      return;
    }

    const res = await upgradeSubscription(targetTier, cardNumber.substring(cardNumber.length - 4), cardHolder);
    if (res.success) {
      setPaymentSuccess(true);
      
      // Fire celebration confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.5 }
      });
      
      // Double blast
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);

    } else {
      setFormError(res.error || 'Payment failed. Please try again.');
    }
  };

  // Pricing configuration
  const planDetails = {
    Pro: {
      name: 'ApexAgile Pro',
      price: '$29',
      features: [
        'Up to 5 secure team workspaces',
        'Add up to 15 members per workspace',
        'Create unlimited agile issues & tasks',
        'Access Sprint backlogs & estimations',
        'Interactive Iteration Burndown charts',
        'Shared kanban card workflows'
      ]
    },
    Enterprise: {
      name: 'ApexAgile Enterprise',
      price: '$99',
      features: [
        'Unlimited workspaces & teams',
        'Unlimited members per workspace',
        'Unlimited issues, sprints & cards',
        'Interactive Timeline & Gantt chart',
        'Exclusive priority support toggle',
        'Advanced system-wide statistics'
      ]
    }
  };

  const details = planDetails[targetTier] || planDetails.Pro;
  const brand = getCardBrand();

  if (!upgradeModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeUpgradeModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-[#0f1524] border border-slate-200 dark:border-darkBorder shadow-glass overflow-hidden z-10 text-xs text-slate-800 dark:text-slate-200"
        >
          {/* Close button */}
          <button
            onClick={closeUpgradeModal}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-darkBorder/60 text-slate-400 hover:text-slate-100 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {!paymentSuccess ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto lg:overflow-hidden">
              {/* Left Column: Order Summary (Frosted Blue Gradient) */}
              <div className="lg:col-span-5 p-8 bg-slate-50 dark:bg-darkSurface/30 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-darkBorder/60 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Badge */}
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                      Subscription Upgrade
                    </span>
                  </div>

                  {/* Limit hit notification banner */}
                  {limitDetails && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-start gap-2 text-[10px] font-semibold leading-relaxed">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        {limitDetails === 'workspace' && "Workspace capacity limit reached on Free plan."}
                        {limitDetails === 'member' && "Member invitation seat limits reached on Free plan."}
                        {limitDetails === 'task' && "Workspace tasks capacity cap reached on Free plan."}
                        Upgrade to {targetTier} now to lift limit instantly and continue your operations!
                      </span>
                    </div>
                  )}

                  {/* Plan Price Summary */}
                  <div>
                    <h3 className="text-xl font-extrabold">{details.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-extrabold tracking-tight">{details.price}</span>
                      <span className="text-slate-400 text-xs font-semibold">/ month</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">INCLUDED BENEFITS:</span>
                    {details.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[11px] font-semibold">
                        <div className="p-0.5 rounded-full bg-brand-500/10 text-brand-400 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 leading-normal">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtotal summary */}
                <div className="border-t border-slate-200 dark:border-darkBorder/40 pt-4 mt-8 space-y-2 text-[11px] font-bold">
                  <div className="flex justify-between text-slate-400">
                    <span>Subscription Rate</span>
                    <span>{details.price}.00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax (VAT 0%)</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-800 dark:text-slate-100 text-xs pt-1 border-t border-dashed border-slate-200 dark:border-darkBorder/40">
                    <span>Amount Due Today</span>
                    <span className="text-brand-400 font-extrabold">{details.price}.00 / mo</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Card Form & Stripe details */}
              <div className="lg:col-span-7 p-8 flex flex-col justify-between items-center space-y-8 bg-white dark:bg-[#0f1524]">
                
                {/* 3D CREDIT CARD CONTAINER */}
                <div className="w-[300px] h-[180px] rounded-2xl relative select-none cursor-pointer perspective-1000">
                  <div
                    className={`w-full h-full relative transition-transform duration-700 ease-in-out transform-style-3d ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    
                    {/* Front of Card */}
                    <div className="w-full h-full absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-900 via-brand-900 to-slate-900 p-5 flex flex-col justify-between border border-white/10 shadow-glass backface-hidden">
                      <div className="flex justify-between items-start">
                        {/* Metallic chip */}
                        <div className="w-9 h-7 rounded bg-gradient-to-br from-yellow-300 to-amber-500 relative overflow-hidden flex flex-col justify-around p-0.5 opacity-85">
                          <div className="h-[1px] bg-slate-800/20 w-full" />
                          <div className="h-[1px] bg-slate-800/20 w-full" />
                          <div className="h-[1px] bg-slate-800/20 w-full" />
                          <div className="absolute left-[30%] w-[1px] h-full bg-slate-800/20" />
                          <div className="absolute right-[30%] w-[1px] h-full bg-slate-800/20" />
                        </div>

                        {/* Card brand logo */}
                        {brand === 'visa' && (
                          <span className="text-lg italic font-extrabold text-sky-200 font-sans tracking-wide">VISA</span>
                        )}
                        {brand === 'mastercard' && (
                          <div className="flex -space-x-2.5 opacity-90">
                            <div className="w-5 h-5 rounded-full bg-red-500" />
                            <div className="w-5 h-5 rounded-full bg-amber-500" />
                          </div>
                        )}
                        {brand === 'generic' && (
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Card number display */}
                      <div className="text-lg tracking-widest text-white text-center font-mono font-bold my-1">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      <div className="flex justify-between items-end text-white/80">
                        <div className="truncate pr-4">
                          <span className="text-[8px] text-white/40 block font-sans font-bold uppercase tracking-wider">Cardholder</span>
                          <span className="text-xs font-bold font-mono tracking-wide truncate max-w-40 block uppercase">
                            {cardHolder || 'CHRIS SQUAD'}
                          </span>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="text-[8px] text-white/40 block font-sans font-bold uppercase tracking-wider">Expires</span>
                          <span className="text-xs font-bold font-mono tracking-wide">
                            {expiry || 'MM/YY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card (Rotated 180deg) */}
                    <div className="w-full h-full absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 p-5 flex flex-col justify-between border border-white/10 shadow-glass backface-hidden rotate-y-180">
                      <div className="w-full h-8 bg-slate-950 absolute top-5 left-0" />
                      
                      <div className="w-full mt-10 space-y-1">
                        <span className="text-[7px] text-white/30 font-bold uppercase tracking-wider block text-right pr-4">Authorized Signature</span>
                        <div className="flex items-center">
                          <div className="flex-1 h-6 bg-slate-200 rounded-lg flex items-center px-2 pr-10 text-[10px] text-slate-600 font-mono italic select-none">
                            xxxx xxxx xxxx
                          </div>
                          <div className="w-10 h-6 bg-white border border-red-500 text-slate-950 font-bold text-xs flex items-center justify-center rounded font-mono shadow ml-[-30px] z-10">
                            {cvv || '•••'}
                          </div>
                        </div>
                      </div>

                      <p className="text-[6px] text-white/20 text-center leading-normal">
                        This card remains property of ApexAgile SaaS simulation. Subject to payment portal conditions. Guaranteed safe checkout.
                      </p>
                    </div>

                  </div>
                </div>

                {/* FORM INPUTS */}
                <form onSubmit={handlePay} className="w-full space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold text-[10px] text-center">
                      {formError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chris Squad"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010 (Demo card starts with 4 or 5)"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full p-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full p-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">CVV</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 123"
                        value={cvv}
                        onChange={handleCvvChange}
                        onFocus={() => setIsFlipped(true)}
                        onBlur={() => setIsFlipped(false)}
                        className="w-full p-3 bg-slate-50 dark:bg-darkBg border border-slate-200 dark:border-darkBorder rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Checkout info */}
                  <div className="pt-4 border-t border-slate-200 dark:border-darkBorder/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[10px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Secured connection via Stripe gateway</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto py-3 px-6 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl font-bold shadow-premium hover:shadow-premium-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        `Upgrade to ${targetTier === 'Pro' ? 'Pro' : 'Enterprise'}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* PAYMENT SUCCESS CELEBRATION CARD */
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-12 text-center flex flex-col items-center justify-center space-y-6 bg-gradient-to-b from-[#0f1524] to-brand-950/20"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-premium">
                <Check className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold">Subscription Activated! 💎</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Congratulations! Your account is successfully updated to <span className="text-brand-400 font-bold">{details.name}</span>. Limits are lifted and premium features are fully unlocked.
                </p>
              </div>

              <button
                onClick={closeUpgradeModal}
                className="py-3 px-8 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-premium hover:scale-105 active:scale-95 transition-all text-xs"
              >
                Let's Build!
              </button>
            </motion.div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
