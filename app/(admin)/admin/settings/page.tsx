import { getSettings } from '@/actions/settings.actions';
import AdminGeneralSettingsForm from '@/components/admin/settings/admin-general-settings-form';

const SettingsPage = async () => {
  const settings = await getSettings();
  // No settings row yet -> leave initialData undefined so the form runs in "create" mode.
  const initialData = settings
    ? {
        storeName: settings.storeName,
        storeEmail: settings.storeEmail ?? '',
        storePhone: settings.storePhone ?? '',
        storeAddress: settings.storeAddress ?? '',
      }
    : undefined;

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
