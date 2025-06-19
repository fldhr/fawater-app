
import React, { useState, useEffect, useCallback } from 'react';
import { Save, Image as ImageIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { BusinessDetails, AppSettings } from '../types';
import { 
  LOCAL_STORAGE_SETTINGS_KEY, 
  LOCAL_STORAGE_BUSINESS_DETAILS_KEY, 
  DEFAULT_APP_SETTINGS, 
  DEFAULT_BUSINESS_DETAILS 
} from '../constants';

const SettingsPage: React.FC = () => {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>(DEFAULT_BUSINESS_DETAILS);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const storedBusinessDetails = localStorage.getItem(LOCAL_STORAGE_BUSINESS_DETAILS_KEY);
    if (storedBusinessDetails) {
      const parsed = JSON.parse(storedBusinessDetails);
      setBusinessDetails(parsed);
      if (parsed.logo) {
        setLogoPreview(parsed.logo);
      }
    }
    const storedAppSettings = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (storedAppSettings) {
      setAppSettings(JSON.parse(storedAppSettings));
    }
  }, []);

  const handleBusinessChange = <K extends keyof BusinessDetails>(field: K, value: BusinessDetails[K]) => {
    setBusinessDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleAppSettingsChange = <K extends keyof AppSettings>(field: K, value: AppSettings[K]) => {
    setAppSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
         setSaveStatus({ type: 'error', message: 'حجم الشعار يجب أن يكون أقل من 2 ميجابايت.' });
         setTimeout(() => setSaveStatus(null), 3000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setBusinessDetails(prev => ({ ...prev, logo: base64String }));
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = useCallback(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_BUSINESS_DETAILS_KEY, JSON.stringify(businessDetails));
      localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(appSettings));
      setSaveStatus({ type: 'success', message: 'تم حفظ الإعدادات بنجاح!' });
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus({ type: 'error', message: 'فشل حفظ الإعدادات. قد تكون مساحة التخزين ممتلئة.' });
    }
    setTimeout(() => setSaveStatus(null), 3000); // Clear message after 3 seconds
  }, [businessDetails, appSettings]);
  
  const inputClass = "w-full p-2.5 border border-gray-300 rounded-lg bg-white/80 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-sm";
  const labelClass = "block mb-1.5 text-sm font-medium text-neutral-dark";
  const checkboxLabelClass = "flex items-center space-x-2 rtl:space-x-reverse text-sm text-neutral-dark cursor-pointer";
  const checkboxClass = "form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors";

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2 className="text-3xl font-bold text-primary mb-8 text-center">إعدادات النظام والفواتير</h2>

      {/* Business Details Section */}
      <section className="p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-6 text-secondary border-b-2 border-secondary/30 pb-2">بيانات المؤسسة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="businessName" className={labelClass}>اسم المؤسسة</label>
            <input type="text" id="businessName" value={businessDetails.name} onChange={e => handleBusinessChange('name', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="taxNumber" className={labelClass}>الرقم الضريبي</label>
            <input type="text" id="taxNumber" value={businessDetails.taxNumber} onChange={e => handleBusinessChange('taxNumber', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="commercialRegister" className={labelClass}>رقم السجل التجاري</label>
            <input type="text" id="commercialRegister" value={businessDetails.commercialRegister} onChange={e => handleBusinessChange('commercialRegister', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>رقم الهاتف</label>
            <input type="tel" id="phone" value={businessDetails.phone} onChange={e => handleBusinessChange('phone', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="website" className={labelClass}>الموقع الإلكتروني</label>
            <input type="url" id="website" value={businessDetails.website} onChange={e => handleBusinessChange('website', e.target.value)} className={inputClass} />
          </div>
           <div>
            <label htmlFor="address" className={labelClass}>عنوان المؤسسة</label>
            <input type="text" id="address" value={businessDetails.address} onChange={e => handleBusinessChange('address', e.target.value)} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="logo" className={labelClass}>شعار المؤسسة</label>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <input type="file" id="logo" accept="image/png, image/jpeg" onChange={handleLogoUpload} className="hidden" />
              <label htmlFor="logo" className="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 text-neutral-dark rounded-lg shadow-sm transition-colors flex items-center space-x-2 rtl:space-x-reverse">
                <ImageIcon size={18} />
                <span>{logoPreview ? 'تغيير الشعار' : 'اختيار شعار'}</span>
              </label>
              {logoPreview && <img src={logoPreview} alt="معاينة الشعار" className="w-20 h-20 object-contain rounded-md border border-gray-300 p-1 bg-white" />}
            </div>
             <p className="text-xs text-gray-500 mt-1">يفضل أن يكون الشعار مربعًا وبخلفية شفافة (PNG). الحد الأقصى للحجم: 2 ميجابايت.</p>
          </div>
        </div>
      </section>

      {/* App Settings Section */}
      <section className="p-6 bg-glass backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold mb-6 text-secondary border-b-2 border-secondary/30 pb-2">إعدادات عرض الحقول والافتراضيات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          <h4 className="md:col-span-2 lg:col-span-3 text-md font-medium text-neutral-dark mb-0">إظهار الحقول في الفاتورة:</h4>
          <label className={checkboxLabelClass}>
            <input type="checkbox" checked={appSettings.showTaxField} onChange={e => handleAppSettingsChange('showTaxField', e.target.checked)} className={checkboxClass} />
            <span>إظهار حقول الضريبة</span>
          </label>
          <label className={checkboxLabelClass}>
            <input type="checkbox" checked={appSettings.showDiscountField} onChange={e => handleAppSettingsChange('showDiscountField', e.target.checked)} className={checkboxClass} />
            <span>إظهار حقول الخصم</span>
          </label>
          <label className={checkboxLabelClass}>
            <input type="checkbox" checked={appSettings.showCommercialRegisterField} onChange={e => handleAppSettingsChange('showCommercialRegisterField', e.target.checked)} className={checkboxClass} />
            <span>إظهار حقل السجل التجاري للمؤسسة</span>
          </label>
           <label className={checkboxLabelClass}>
            <input type="checkbox" checked={appSettings.showWebsiteField} onChange={e => handleAppSettingsChange('showWebsiteField', e.target.checked)} className={checkboxClass} />
            <span>إظهار حقل موقع المؤسسة</span>
          </label>
           <label className={checkboxLabelClass}>
            <input type="checkbox" checked={appSettings.showBusinessAddressField} onChange={e => handleAppSettingsChange('showBusinessAddressField', e.target.checked)} className={checkboxClass} />
            <span>إظهار حقل عنوان المؤسسة</span>
          </label>
           <label className={checkboxLabelClass}>
            <input type="checkbox" checked={appSettings.showClientAddressField} onChange={e => handleAppSettingsChange('showClientAddressField', e.target.checked)} className={checkboxClass} />
            <span>إظهار حقل عنوان العميل</span>
          </label>
          
          <h4 className="md:col-span-2 lg:col-span-3 text-md font-medium text-neutral-dark mt-4 mb-0">القيم الافتراضية:</h4>
          <div>
            <label htmlFor="defaultTax" className={labelClass}>نسبة الضريبة الافتراضية (%)</label>
            <input type="number" id="defaultTax" value={appSettings.defaultTaxPercentage} min="0" max="100" step="0.01" onChange={e => handleAppSettingsChange('defaultTaxPercentage', parseFloat(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label htmlFor="defaultDiscount" className={labelClass}>نسبة الخصم الافتراضية (%)</label>
            <input type="number" id="defaultDiscount" value={appSettings.defaultDiscountPercentage} min="0" max="100" step="0.01" onChange={e => handleAppSettingsChange('defaultDiscountPercentage', parseFloat(e.target.value))} className={inputClass} />
          </div>
        </div>
      </section>
      
      {/* Save Button & Status Message */}
      <section className="text-center py-4">
        {saveStatus && (
          <div className={`mb-4 p-3 rounded-md text-sm flex items-center justify-center space-x-2 rtl:space-x-reverse ${saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {saveStatus.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            <span>{saveStatus.message}</span>
          </div>
        )}
        <button
          onClick={handleSaveSettings}
          className="px-8 py-3 bg-accent hover:bg-emerald-600 text-white text-lg font-semibold rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-2 rtl:space-x-reverse mx-auto"
        >
          <Save size={20} />
          <span>حفظ الإعدادات</span>
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
