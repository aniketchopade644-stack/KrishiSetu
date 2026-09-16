import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Landmark,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  FileText,
  BadgePercent,
  HelpCircle,
  ArrowUpRight,
  SunMedium,
  Coins,
  ShieldAlert,
  Sprout,
  Filter,
  Info,
} from 'lucide-react';

const SCHEMES = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'income',
    categoryLabel: 'Direct Income Support',
    tag: 'National Flagship',
    benefit: '₹6,000 per year',
    benefitDetail: 'Paid in 3 equal 4-monthly installments of ₹2,000 directly via DBT into Aadhaar-linked bank accounts.',
    eligibility: [
      'All landholding farmer families with cultivable landholding in their names',
      'Valid Aadhaar card linked to active bank account',
      'Land records updated in state revenue database (7/12, Khatoni)',
    ],
    documents: ['Aadhaar Card', 'Land Ownership Records (Khata/Khasra)', 'Bank Account Passbook'],
    officialUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 011-24300606',
    status: 'Active • 2026 Installments Ongoing',
    badgeColor: 'emerald',
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'insurance',
    categoryLabel: 'Crop Insurance',
    tag: 'Risk Protection',
    benefit: 'Comprehensive Crop Risk Cover',
    benefitDetail: 'Subsidized premium: only 1.5% for Rabi, 2% for Kharif, and 5% for commercial/horticultural crops. Full claim against drought, floods & unseasonal rains.',
    eligibility: [
      'All farmers growing notified food, oilseed and annual horticultural crops',
      'Applicable for both loanee (bank-linked) and non-loanee farmers',
      'Coverage from pre-sowing to post-harvest losses',
    ],
    documents: ['Land Possession Certificate', 'Sowing Declaration Certificate', 'Aadhaar & Bank Passbook'],
    officialUrl: 'https://pmfby.gov.in',
    helpline: '14447',
    status: 'Active • Kharif & Rabi Enrollment Open',
    badgeColor: 'blue',
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
    ministry: 'Ministry of New & Renewable Energy (MNRE)',
    category: 'solar',
    categoryLabel: 'Solar Energy & Pumps',
    tag: 'Green Energy Subsidy',
    benefit: 'Up to 60% Solar Pump Subsidy',
    benefitDetail: 'Central + State Government provide up to 60% capital subsidy for installing 3HP to 7.5HP solar agriculture pumps + 30% bank loan support.',
    eligibility: [
      'Individual farmers, cooperatives, Panchayats and Water User Associations',
      'Farmers dependent on diesel pumps or grid-deficient irrigation',
      'Option to sell surplus solar power back to grid DISCOMs',
    ],
    documents: ['Land Records', 'Aadhaar Card', 'Water Source Verification', 'Bank Account Info'],
    officialUrl: 'https://pmkusum.mnre.gov.in',
    helpline: '1800-180-3333',
    status: 'Active • Subsidies Available',
    badgeColor: 'amber',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) & Interest Subvention',
    ministry: 'Ministry of Finance & RBI / NABARD',
    category: 'credit',
    categoryLabel: 'Low-Interest Credit',
    tag: 'Agricultural Credit',
    benefit: 'Crop Loans at 4% Interest Rate',
    benefitDetail: 'Working capital credit up to ₹3,00,000 at 7% p.a. with 3% prompt repayment incentive, making the effective rate just 4%. Collateral-free up to ₹1.60 Lakh.',
    eligibility: [
      'All farmers, tenant farmers, sharecroppers and self-help groups (SHGs)',
      'Farmers involved in animal husbandry, poultry, dairy and fisheries',
      'Simplified single-page application at any nationalized or cooperative bank',
    ],
    documents: ['Land Records / Tenancy Proof', 'KYC (Aadhaar, PAN / Voter ID)', 'Passport Photo'],
    officialUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    helpline: '1800-180-1551',
    status: 'Active • Instant KCC Campaign',
    badgeColor: 'teal',
  },
  {
    id: 'pkvy-shc',
    name: 'Soil Health Card & PKVY (Paramparagat Krishi Vikas)',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    category: 'soil',
    categoryLabel: 'Soil Health & Organic Farming',
    tag: 'Soil Nutrition',
    benefit: '₹50,000/ha Support + Free Soil Testing',
    benefitDetail: 'Free comprehensive 12-parameter soil testing report every 2 years plus ₹50,000 per hectare financial incentive for adopting certified organic farm practices.',
    eligibility: [
      'All farmers seeking scientifically guided fertilizer dosage and micronutrient analysis',
      'Farmer groups or clusters (20-50 farmers) adopting non-chemical organic inputs',
      'Free testing at nearest Krishi Vigyan Kendra (KVK) or Govt Mobile Testing Lab',
    ],
    documents: ['Aadhaar Card', 'Farm Coordinates / Plot details', 'Soil Sample Submission slip'],
    officialUrl: 'https://soilhealth.dac.gov.in',
    helpline: '1800-180-1551',
    status: 'Active • Nationwide KVK Drive',
    badgeColor: 'emerald',
  },
];

const getCategories = (t) => [
  { id: 'all', label: t('schemes.all_schemes') },
  { id: 'income', label: t('schemes.income_support') },
  { id: 'insurance', label: t('schemes.crop_insurance') },
  { id: 'solar', label: t('schemes.solar_energy') },
  { id: 'credit', label: t('schemes.credit_loans') },
  { id: 'soil', label: t('schemes.soil_organic') },
];

const GovernmentSchemes = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const filteredSchemes = SCHEMES.filter((scheme) => {
    const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.benefitDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Landmark className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">
              {t('schemes.title')}
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('schemes.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('schemes.search_placeholder')}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Highlights Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <Coins className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">PM-KISAN DBT</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white font-heading">₹6,000 / yr</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Directly into bank account</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Crop Insurance</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white font-heading">1.5% - 2%</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Low premium comprehensive cover</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <SunMedium className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Solar Pump Subsidy</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white font-heading">Up to 60%</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Capital grant for off-grid power</p>
        </div>

        <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 dark:border-teal-900/50 dark:bg-teal-950/30">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <BadgePercent className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Kisan Credit Card</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-slate-900 dark:text-white font-heading">4% Interest</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Short-term farm credit up to ₹3L</p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        {getCategories(t).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 rounded-xl px-3.5 py-1.5 font-bold transition duration-150 ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="space-y-4">
              {/* Header tags */}
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {scheme.categoryLabel}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {scheme.status}
                </span>
              </div>

              {/* Title & Ministry */}
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading leading-snug">
                  {scheme.name}
                </h3>
                <p className="mt-1 text-[11px] font-medium text-slate-400">{scheme.ministry}</p>
              </div>

              {/* Benefit Highlight Card */}
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/60 border border-emerald-100 p-3.5 dark:from-emerald-950/40 dark:to-teal-950/30 dark:border-emerald-900/40">
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  Key Benefit
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-emerald-900 dark:text-emerald-100 font-heading">
                  {scheme.benefit}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {scheme.benefitDetail}
                </p>
              </div>

              {/* Eligibility Highlights */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('schemes.eligibility')}
                </p>
                <ul className="space-y-1.5">
                  {scheme.eligibility.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents Tags */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('schemes.documents')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.documents.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <FileText className="h-3 w-3 text-slate-400" />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <PhoneCall className="h-3 w-3 text-emerald-600" />
                {t('schemes.helpline')}: <strong className="text-slate-700 dark:text-slate-300">{scheme.helpline}</strong>
              </span>

              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
              >
                {t('schemes.apply_portal')}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Official Assistance Banner */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-emerald-900 to-green-950 p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 dark:border-slate-800">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <PhoneCall className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              National Kisan Call Centre (Toll-Free)
            </span>
          </div>
          <h3 className="text-xl font-extrabold font-heading">Need help with Government Scheme applications?</h3>
          <p className="text-xs text-emerald-100/80">
            Call 1800-180-1551 (6:00 AM to 10:00 PM on all 7 days) to speak directly with an agricultural officer.
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="shrink-0 rounded-2xl bg-white px-6 py-3 text-xs font-extrabold text-emerald-950 hover:bg-emerald-50 transition shadow-lg"
        >
          Call 1800-180-1551
        </a>
      </div>
    </div>
  );
};

export default GovernmentSchemes;
