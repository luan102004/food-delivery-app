'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface PromoCodeInputProps {
  orderAmount: number;
  restaurantId: string;
  onApply: (discount: number, promotionId: string) => void;
}

export default function PromoCodeInput({
  orderAmount,
  restaurantId,
  onApply,
}: PromoCodeInputProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          orderAmount,
          restaurantId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('promotion.invalid'));
        return;
      }

      if (data.valid) {
        onApply(data.promotion.discount, data.promotion.id);
        setApplied(true);
        setError('');
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t('promotion.code')}
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={t('promotion.enterCode')}
          disabled={applied}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
        <button
          onClick={handleApply}
          disabled={loading || applied || !code.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '...' : applied ? '✓' : t('promotion.apply')}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {applied && (
        <p className="text-green-600 text-sm mt-2">
          ✓ {t('promotion.applied')}
        </p>
      )}
    </div>
  );
}