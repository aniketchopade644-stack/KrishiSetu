/**
 * Weather condition & advisory translation and formatting utilities.
 * Ensures strictly English text is displayed in English mode (no mixed Hindi/Marathi words).
 * When the user switches to Hindi or Marathi, clean localized terms are displayed.
 */

const CONDITION_TRANSLATIONS = {
  'Clear Sky': { en: 'Clear Sky', hi: 'साफ आसमान', mr: 'निरभ्र आकाश' },
  'Mainly Clear': { en: 'Mainly Clear', hi: 'मुख्यतः साफ', mr: 'मुख्यत्वे निरभ्र' },
  'Partly Cloudy': { en: 'Partly Cloudy', hi: 'आंशिक रूप से बादलमय', mr: 'अंशतः ढगाळ' },
  'Overcast': { en: 'Overcast', hi: 'घने बादल', mr: 'पूर्ण ढगाळ' },
  'Foggy': { en: 'Foggy', hi: 'कोहरा', mr: 'धुके' },
  'Depositing Rime Fog': { en: 'Depositing Rime Fog', hi: 'पाला युक्त कोहरा', mr: 'गारठलेले धुके' },
  'Light Drizzle': { en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी', mr: 'हलकी रिमझिम' },
  'Moderate Drizzle': { en: 'Moderate Drizzle', hi: 'मध्यम बूंदाबांदी', mr: 'मध्यम रिमझिम' },
  'Dense Drizzle': { en: 'Dense Drizzle', hi: 'तेज बूंदाबांदी', mr: 'दाट रिमझिम' },
  'Slight Rain': { en: 'Slight Rain', hi: 'हल्की बारिश', mr: 'हलका पाऊस' },
  'Moderate Rain': { en: 'Moderate Rain', hi: 'मध्यम बारिश', mr: 'मध्यम पाऊस' },
  'Heavy Rain': { en: 'Heavy Rain', hi: 'भारी बारिश', mr: 'मुसळधार पाऊस' },
  'Rain Showers': { en: 'Rain Showers', hi: 'बारिश की बौछारें', mr: 'पावसाच्या सरी' },
  'Moderate Showers': { en: 'Moderate Showers', hi: 'मध्यम बौछारें', mr: 'मध्यम सरी' },
  'Violent Showers': { en: 'Violent Showers', hi: 'तेज बौछारें', mr: 'मुसळधार सरी' },
  'Thunderstorm': { en: 'Thunderstorm', hi: 'तूफान और गरज', mr: 'वादळी पाऊस' },
};

const ADVISORY_TRANSLATIONS = {
  'High Past Rainfall Accumulation': {
    en: 'High Past Rainfall Accumulation',
    hi: 'अत्यधिक वर्षा संचय',
    mr: 'मागील आठवड्यात मुसळधार पाऊस',
  },
  'Heavy Rain Expected': {
    en: 'Heavy Rain Expected',
    hi: 'भारी बारिश की संभावना',
    mr: 'पावसाची शक्यता',
  },
  'High Evapotranspiration': {
    en: 'High Evapotranspiration',
    hi: 'सिंचाई परामर्श (उच्च वाष्पीकरण)',
    mr: 'सिंचन सल्ला',
  },
  'Normal Irrigation Schedule': {
    en: 'Normal Irrigation Schedule',
    hi: 'सामान्य सिंचाई कार्यक्रम',
    mr: 'नियमित सिंचन वेळापत्रक',
  },
  'High Wind Alert - Avoid Spraying': {
    en: 'High Wind Alert - Avoid Spraying',
    hi: 'तेज हवा का अलर्ट - छिड़काव से बचें',
    mr: 'फवारणी टाळा - जोरदार वारे',
  },
  'Rain Hazard for Spraying': {
    en: 'Rain Hazard for Spraying',
    hi: 'छिड़काव हेतु बारिश का खतरा',
    mr: 'फवारणीसाठी पावसाचा धोका',
  },
  'Favorable Spraying Window': {
    en: 'Favorable Spraying Window',
    hi: 'अनुकूल छिड़काव समय',
    mr: 'अनुकूल फवारणी वेळ',
  },
  'Heatwave Alert': {
    en: 'Heatwave Alert',
    hi: 'लू एवं अत्यधिक तापमान चेतावनी',
    mr: 'उष्णतेची लाट',
  },
  'Low Temperature': {
    en: 'Low Temperature',
    hi: 'शीत लहर चेतावनी',
    mr: 'थंडीचा इशारा',
  },
};

/**
 * Format condition text cleanly according to current active language.
 * Strips any legacy "/ Marathi" or "/ Hindi" strings returned by backend.
 */
export const formatWeatherCondition = (rawText, currentLang = 'en') => {
  if (!rawText) return '';
  // Isolate the pure English key in case backend concatenated strings with " / "
  const cleanEnglish = rawText.split('/')[0].trim();
  const entry = CONDITION_TRANSLATIONS[cleanEnglish];
  if (entry && entry[currentLang]) {
    return entry[currentLang];
  }
  return cleanEnglish;
};

/**
 * Format advisory title cleanly according to current active language.
 */
export const formatAdvisoryTitle = (rawTitle, currentLang = 'en') => {
  if (!rawTitle) return '';
  const cleanEnglish = rawTitle.split('/')[0].trim();
  const entry = ADVISORY_TRANSLATIONS[cleanEnglish];
  if (entry && entry[currentLang]) {
    return entry[currentLang];
  }
  return cleanEnglish;
};
