import { getSettings } from '@/actions/settings.actions';
import AdminGeneralSettingsForm from '@/components/admin/settings/admin-general-settings-form';

const SettingsPage = async () => {
  const settings = await getSettings();
  console.log('settings', settings);
  const initialData = {
    storeName: settings.storeName,
    storeEmail: settings.storeEmail,
    storePhone: settings.storePhone,
    storeAddress: settings.storeAddress,
  };

  return (
    <div>
      SettingsPage
      <AdminGeneralSettingsForm
        initialData={initialData}
        id={settings?.id}
      />
    </div>
  );
};

export default SettingsPage;
