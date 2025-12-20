'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
  const router = useRouter();
  
  return (
    <section id="pricing" className="relative px-4 sm:px-6 lg:px-8 py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center space-y-6"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Pro Access
          </h2>
          <p className="text-lg text-gray-600">
            Download 4K Transparent PNGs
          </p>
          <motion.button
            onClick={() => router.push('/pricing')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="mt-6 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Subscribe
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
