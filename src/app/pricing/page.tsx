'use client';

import { motion } from 'framer-motion';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useSubscription } from '@/hooks/useSubscription';
import { isCurrentOrIncludedPlan, type SubscriptionPlan } from '@/lib/subscription';

export default function PricingPage() {
  const router = useRouter();
  const { plan: userPlan, updatePlan, isAuthenticated, isLoading: subscriptionLoading } = useSubscription();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const plans = [
    {
      name: 'Free',
      key: 'free' as SubscriptionPlan,
      price: '$0',
      period: 'forever',
      description: 'Perfect for exploring and learning',
      icon: Star,
      color: 'gray',
      features: [
        'Access to free sticker library',
        'View prompts for free stickers',
        'Download standard quality (1K)',
        'Community support',
        'Limited downloads per month',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      key: 'pro' as SubscriptionPlan,
      price: '$9',
      period: 'month',
      description: 'For creators and professionals',
      icon: Zap,
      color: 'blue',
      features: [
        'Everything in Free',
        'Access to premium sticker library',
        'Download 4K transparent PNGs',
        'Unlimited downloads',
        'Copy premium prompts',
        'Priority support',
        'Early access to new features',
      ],
      cta: 'Subscribe Now',
      popular: true,
    },
    {
      name: 'Studio',
      key: 'studio' as SubscriptionPlan,
      price: '$29',
      period: 'month',
      description: 'For teams and power users',
      icon: Crown,
      color: 'purple',
      features: [
        'Everything in Pro',
        'Commercial license',
        'API access',
        'Bulk download tools',
        'Custom sticker generation',
        'Dedicated support',
        'Team collaboration features',
        'Analytics dashboard',
      ],
      cta: 'Coming Soon',
      popular: false,
    },
  ];

  // Handle redirect after sign-in with plan parameter
  useEffect(() => {
    if (subscriptionLoading || typeof window === 'undefined') return; // Wait for subscription data to load and ensure client-side
    
    // Read plan parameter from URL safely
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    
    if (planParam && isAuthenticated) {
      // User just signed in and returned with a plan parameter
      const targetPlan = planParam as SubscriptionPlan;
      
      // Check if user already has premium
      if (targetPlan === 'pro' && (userPlan === 'pro' || userPlan === 'studio')) {
        // User already has Pro or Studio
        const message = userPlan === 'studio' 
          ? 'You already have Studio plan (includes Pro)!'
          : 'You already have a Pro subscription!';
        setToastMessage(message);
        setShowToast(true);
        // Clear URL parameters
        router.replace('/pricing');
        setTimeout(() => setShowToast(false), 4000);
      } else if (targetPlan === 'pro' && userPlan === 'free') {
        // User is free, proceed to Stripe checkout
        window.open('https://buy.stripe.com/28EdRb3tuc894oS08j4sE00', '_blank');
        // Clear URL parameters
        router.replace('/pricing');
      }
    }
  }, [isAuthenticated, userPlan, router, subscriptionLoading]);

  const handleSubscribe = (planName: string, planKey: SubscriptionPlan) => {
    // Check if this is the current plan or already included
    if (isCurrentOrIncludedPlan(userPlan, planKey)) {
      return; // Don't allow subscribing to current/included plan
    }

    // For paid plans, require authentication
    if (planKey === 'pro' || planKey === 'studio') {
      if (!isAuthenticated) {
        // Redirect to sign-in with callback URL and plan parameter
        const callbackUrl = encodeURIComponent(`/pricing?plan=${planKey}`);
        router.push(`/signin?callbackUrl=${callbackUrl}`);
        return;
      }
    }

    // Handle different plans
    if (planKey === 'free') {
      updatePlan('free');
    } else if (planKey === 'pro') {
      // Pro plan: Link to Stripe checkout (user is authenticated)
      window.open('https://buy.stripe.com/28EdRb3tuc894oS08j4sE00', '_blank');
    } else if (planKey === 'studio') {
      // Studio plan: Mailto link
      window.open('mailto:support@cybersticker.com?subject=Studio Plan Inquiry', '_self');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div id="pricing" className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock premium features and access thousands of high-quality AI-generated stickers
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((planItem, index) => {
              const Icon = planItem.icon;
              const isCurrentPlan = isAuthenticated && userPlan === planItem.key;
              const isIncludedPlan = isAuthenticated && isCurrentOrIncludedPlan(userPlan, planItem.key) && !isCurrentPlan;
              const isDisabled = isCurrentPlan || isIncludedPlan;
              
              return (
                <motion.div
                  key={planItem.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                    planItem.popular
                      ? 'border-blue-500 scale-105 md:scale-110'
                      : 'border-gray-200'
                  } p-8 flex flex-col ${isDisabled ? 'opacity-75' : ''}`}
                >
                  {planItem.popular && !isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                      planItem.color === 'gray' ? 'bg-gray-100 text-gray-600' :
                      planItem.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {planItem.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {planItem.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {planItem.price}
                      </span>
                      {planItem.period !== 'forever' && (
                        <span className="text-gray-600">/{planItem.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="flex-1 space-y-3 mb-8">
                    {planItem.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {planItem.key === 'pro' && !isDisabled ? (
                    <motion.button
                      onClick={() => handleSubscribe(planItem.name, planItem.key)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 px-6 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 text-center"
                    >
                      {planItem.cta}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => !isDisabled && handleSubscribe(planItem.name, planItem.key)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.02 } : {}}
                      whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        isDisabled
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : planItem.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : planItem.name === 'Free'
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : isIncludedPlan ? 'Included in Your Plan' : planItem.cta}
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access to premium features until the end of your billing period.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners.',
                },
                {
                  q: 'Do you offer refunds?',
                  a: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.',
                },
                {
                  q: 'Can I upgrade or downgrade my plan?',
                  a: 'Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.',
                },
                {
                  q: 'What is the difference between Pro and Studio?',
                  a: 'Pro is perfect for individual creators, while Studio includes commercial licensing, API access, and team collaboration features for businesses.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600">{faq.a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-16"
          >
            <p className="text-gray-600 mb-4">
              Still have questions?{' '}
              <a href="mailto:support@cybersticker.com" className="text-gray-900 font-medium hover:underline">
                Contact our support team
              </a>
            </p>
          </motion.div>
        </div>
      </div>
      <Toast show={showToast} message={toastMessage} />
    </div>
  );
}
