import { getSettings } from '@/actions/settings.actions';
import AdminShippingSettingsForm from '@/components/admin/settings/admin-shipping-settings-form';
import React from 'react';

const ShippingSettingPage = async () => {
  const settings = await getSettings();
  return (
    <div>
      <AdminShippingSettingsForm
        id={settings?.id}
        initialData={{
          shippingFee: Number(settings?.shippingFee),
          taxRate: Number(settings?.taxRate),
          freeShippingThreshold: Number(settings?.freeShippingThreshold),
        }}
      />
    </div>
  );
};

export default ShippingSettingPage;
