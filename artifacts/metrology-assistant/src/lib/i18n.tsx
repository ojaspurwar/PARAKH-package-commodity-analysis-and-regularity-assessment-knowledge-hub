import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'hi';

export interface Translations {
  // Navigation & Shell
  workspace: string;
  fieldScanner: string;
  supervisorView: string;
  productsRepo: string;
  onlineProducts: string;
  statutoryDocs: string;
  systemStatus: string;
  serviceOnline: string;
  serviceChecking: string;
  serviceReady: string;
  offlineQueueNote: string;
  enforcement: string;
  captureDesk: string;
  supervisorOverview: string;
  statutoryHub: string;
  evidenceDetail: string;
  syncStable: string;
  switchRole: string;

  // Status Pills & Badges
  compliant: string;
  violation: string;
  pendingReview: string;

  // Home / Capture Desk
  fieldDeskBadge: string;
  heroTitle: string;
  heroAccent: string;
  heroSub: string;
  evidenceWorkflow: string;
  intermittentNetwork: string;
  openSupervisorView: string;
  startNewInspection: string;
  scanBarcode: string;
  startScan: string;
  readyWhenYouAre: string;
  readySub: string;
  beginCapture: string;
  captureModeActive: string;
  enterWhatLabelTells: string;
  cancel: string;
  productName: string;
  category: string;
  location: string;
  labelText: string;
  labelTextHint: string;
  capturedEvidence: string;
  capturePhoto: string;
  removePhoto: string;
  readingLabel: string;
  saveAndAnalyze: string;
  savingScan: string;
  recentScans: string;
  recentScansSub: string;
  searchPlaceholder: string;
  filterAll: string;
  filterCompliant: string;
  filterViolation: string;
  filterPending: string;
  noScansYet: string;
  noScansSub: string;
  reviewBannerTitle: string;
  reviewBannerSub: string;
  submitToSupervisor: string;
  submitting: string;
  viewDetails: string;

  // Categories
  catFood: string;
  catPersonalCare: string;
  catHousehold: string;
  catElectrical: string;
  catOther: string;

  // Dashboard
  supervisorToday: string;
  dayAtGlance: string;
  dayAtGlanceSub: string;
  recordsInRepo: string;
  allCapturedEvidence: string;
  complianceRate: string;
  basedOnSubmitted: string;
  productsTracked: string;
  distinctCommodities: string;
  queuedOffline: string;
  waitingConnection: string;
  recentAuditActivity: string;
  newScan: string;
  violationBreakdown: string;
  noFailedDeclarations: string;
  attentionQueue: string;
  exceptionsToReview: string;
  topViolationSignal: string;
  needsAttention: string;
  allClear: string;
  allClearSub: string;
  lastSync: string;
  allDevicesChecked: string;

  // Products Repository
  complianceRepo: string;
  everyProductOneHistory: string;
  everyProductSub: string;
  recordsCount: string;
  productsCount: string;
  violationsCount: string;
  searchProductsPlaceholder: string;
  inspections: string;
  firstSeen: string;
  repeatOffenderWarning: string;
  emptyRepoTitle: string;
  emptyRepoSub: string;
  productHistoryBuiltAutomatically: string;

  // E-Commerce
  ecommerceTitle: string;
  ecommerceSub: string;
  ecommerceUrlLabel: string;
  ecommerceUrlPlaceholder: string;
  auditListing: string;
  auditing: string;
  pasteUrlHint: string;

  // Scan Detail
  backToScans: string;
  evidenceRecord: string;
  noImageAttached: string;
  noImageSub: string;
  reviewTrail: string;
  complianceChecks: string;
  machineTranscription: string;
  labelTextCaptured: string;
  noOcrText: string;
  enforcementNoticeTitle: string;
  copyNoticeMemo: string;
  copied: string;
  enforcementNoticeDesc: string;
  recordControls: string;
  inspectionReports: string;
  submittedToRegister: string;
  awaitingSubmission: string;
  evidenceHashLabel: string;
  downloadPdfReport: string;
  exportCsv: string;
  exportJson: string;
  submitEvidenceToRegister: string;
  deleteRecord: string;
  deleteConfirm: string;
  deleting: string;
  recordDeleted: string;
  deleteProductAll: string;
  deleteProductConfirm: string;

  // Statutory Declarations Keys
  declMrp: string;
  declUsp: string;
  declQty: string;
  declDate: string;
  declContact: string;
  declPacker: string;
  declOrigin: string;
  declPlacement: string;
  declFont: string;
  declReadability: string;
  declExemption: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    // Navigation & Shell
    workspace: 'Workspace',
    fieldScanner: 'Field scanner',
    supervisorView: 'Supervisor view',
    productsRepo: 'Products repository',
    onlineProducts: 'Online products',
    statutoryDocs: 'Statutory & Tech Docs',
    systemStatus: 'System status',
    serviceOnline: 'Service online',
    serviceChecking: 'Checking service',
    serviceReady: 'Service ready',
    offlineQueueNote: 'Evidence is queued locally if a field connection drops.',
    enforcement: 'Enforcement /',
    captureDesk: 'Capture desk',
    supervisorOverview: 'Supervisor Overview',
    statutoryHub: 'Statutory Knowledge Hub',
    evidenceDetail: 'Evidence detail',
    syncStable: 'Sync stable',
    switchRole: 'Switch Role & Access',

    // Status Pills & Badges
    compliant: 'Compliant',
    violation: 'Violation',
    pendingReview: 'Pending review',

    // Home / Capture Desk
    fieldDeskBadge: 'Field desk',
    heroTitle: 'Inspect with confidence.',
    heroAccent: 'Record what matters.',
    heroSub: 'A clear, defensible record of every packaged good you inspect — from first capture to final submission.',
    evidenceWorkflow: 'Evidence-first workflow',
    intermittentNetwork: 'Works with intermittent network',
    openSupervisorView: 'Open supervisor view',
    startNewInspection: 'Start a new inspection',
    scanBarcode: 'Scan barcode',
    startScan: 'Start scan',
    readyWhenYouAre: 'Ready when you are',
    readySub: 'Capture the package, confirm the label details, and submit a clean evidence trail in under a minute.',
    beginCapture: 'Begin capture',
    captureModeActive: 'Capture mode active',
    enterWhatLabelTells: 'Enter what the label tells you.',
    cancel: 'Cancel',
    productName: 'Product name',
    category: 'Category',
    location: 'Inspection location',
    labelText: 'Label text (what you see on the pack)',
    labelTextHint: 'Or attach a photo to read the label automatically.',
    capturedEvidence: 'Attached package photo',
    capturePhoto: 'Capture / upload photo',
    removePhoto: 'Remove photo',
    readingLabel: 'Reading label from photo…',
    saveAndAnalyze: 'Save & analyze compliance',
    savingScan: 'Analyzing compliance…',
    recentScans: 'Recent inspections',
    recentScansSub: 'Physical and online product scans recorded in this workspace.',
    searchPlaceholder: 'Search recent scans…',
    filterAll: 'All',
    filterCompliant: 'Compliant',
    filterViolation: 'Violations',
    filterPending: 'Pending',
    noScansYet: 'No inspections captured yet',
    noScansSub: 'Use the button above to photograph a label or scan a barcode.',
    reviewBannerTitle: 'Inspection captured successfully',
    reviewBannerSub: 'Mandatory declarations verified against Legal Metrology Rules, 2011.',
    submitToSupervisor: 'Submit to supervisor queue',
    submitting: 'Submitting…',
    viewDetails: 'View complete report',

    // Categories
    catFood: 'Packaged food',
    catPersonalCare: 'Personal care',
    catHousehold: 'Household goods',
    catElectrical: 'Electrical goods',
    catOther: 'Other',

    // Dashboard
    supervisorToday: 'Supervisor console / today',
    dayAtGlance: 'The day, at a glance.',
    dayAtGlanceSub: 'A compact view of field activity, exceptions, and the evidence waiting for your attention.',
    recordsInRepo: 'Records in repository',
    allCapturedEvidence: 'All captured evidence',
    complianceRate: 'Compliance rate',
    basedOnSubmitted: 'Based on submitted checks',
    productsTracked: 'Products tracked',
    distinctCommodities: 'Distinct commodities reviewed',
    queuedOffline: 'Queued offline',
    waitingConnection: 'Waiting for a connection',
    recentAuditActivity: 'Recent audit activity',
    newScan: 'New scan',
    violationBreakdown: 'Violation breakdown',
    noFailedDeclarations: 'No failed declarations on record — the register is clean.',
    attentionQueue: 'Attention queue',
    exceptionsToReview: 'Exceptions to review',
    topViolationSignal: 'Top violation signal',
    needsAttention: 'Needs attention',
    allClear: 'All clear for now',
    allClearSub: 'No pending exceptions in today’s stream.',
    lastSync: 'Last sync',
    allDevicesChecked: 'All field devices checked in recently.',

    // Products Repository
    complianceRepo: 'Compliance repository',
    everyProductOneHistory: 'Every product, one history.',
    everyProductSub: 'Scanned packaged commodities grouped by product — with their full inspection history, so repeat non-compliance is easy to spot.',
    recordsCount: 'records',
    productsCount: 'products',
    violationsCount: 'violations',
    searchProductsPlaceholder: 'Search the product repository…',
    inspections: 'inspections',
    firstSeen: 'First seen',
    repeatOffenderWarning: 'Repeat attention — prior inspection(s) found violations',
    emptyRepoTitle: 'Repository is empty',
    emptyRepoSub: 'Scans you capture on the field desk appear here, grouped by product with their compliance history.',
    productHistoryBuiltAutomatically: 'Product history is built automatically from the local register. Open any inspection for the full evidence trail, checks and PDF report.',

    // E-Commerce
    ecommerceTitle: 'Audit digital product listings',
    ecommerceSub: 'Verify that e-commerce marketplaces declare all mandatory Legal Metrology information before consumer purchase under Rule 6(10).',
    ecommerceUrlLabel: 'E-commerce product URL (Amazon, Flipkart, Blinkit, etc.)',
    ecommerceUrlPlaceholder: 'https://www.amazon.in/dp/... or https://www.flipkart.com/...',
    auditListing: 'Audit listing compliance',
    auditing: 'Auditing product…',
    pasteUrlHint: 'Enter an online product link to check digital packaging compliance.',

    // Scan Detail
    backToScans: 'Back to scans',
    evidenceRecord: 'Evidence record',
    noImageAttached: 'No package image attached',
    noImageSub: 'The structured label transcription below remains part of this evidence record.',
    reviewTrail: 'Review trail',
    complianceChecks: 'Compliance checks',
    machineTranscription: 'Machine transcription',
    labelTextCaptured: 'Label text captured',
    noOcrText: 'No OCR text was recorded for this scan.',
    enforcementNoticeTitle: 'Enforcement Notice & Seizure Memo (Rule 19-21)',
    copyNoticeMemo: 'Copy notice memo',
    copied: 'Copied',
    enforcementNoticeDesc: 'Statutory violation detected under Section 36, Legal Metrology Act, 2009. Copy this pre-formatted violation summary for drafting seizure memos or compounding orders under Rule 32A.',
    recordControls: 'Record controls & reports',
    inspectionReports: 'Inspection reports',
    submittedToRegister: 'Submitted to register',
    awaitingSubmission: 'Awaiting submission',
    evidenceHashLabel: 'Evidence hash (SHA-256)',
    downloadPdfReport: 'Download PDF report (court-admissible)',
    exportCsv: 'Export CSV (sheet)',
    exportJson: 'Export JSON (data)',
    submitEvidenceToRegister: 'Submit evidence to register',
    deleteRecord: 'Delete Entry',
    deleteConfirm: 'Are you sure you want to delete this inspection record? This action cannot be undone.',
    deleting: 'Deleting…',
    recordDeleted: 'Record deleted successfully.',
    deleteProductAll: 'Delete Product & All History',
    deleteProductConfirm: 'Are you sure you want to delete all inspection records for this product? This action cannot be undone.',

    // Statutory Declarations Keys
    declMrp: 'MRP declaration',
    declUsp: 'Unit sale price',
    declQty: 'Net quantity & SI units',
    declDate: 'Date marking',
    declContact: 'Consumer care details',
    declPacker: 'Packer / importer details',
    declOrigin: 'Country of origin',
    declPlacement: 'Declaration placement',
    declFont: 'Font size requirement',
    declReadability: 'Readability (print quality)',
    declExemption: 'Rule 26 Exemption',
  },
  hi: {
    // Navigation & Shell
    workspace: 'कार्यक्षेत्र (Workspace)',
    fieldScanner: 'फील्ड स्कैनर',
    supervisorView: 'सुपरवाइज़र डैशबोर्ड',
    productsRepo: 'उत्पाद रजिस्टर',
    onlineProducts: 'ऑनलाइन उत्पाद (ई-कॉमर्स)',
    statutoryDocs: 'विधिक नियम व वास्तुकला',
    systemStatus: 'प्रणाली स्थिति',
    serviceOnline: 'सेवा सक्रिय (Online)',
    serviceChecking: 'जांच जारी है…',
    serviceReady: 'सेवा तैयार',
    offlineQueueNote: 'नेटवर्क बाधित होने पर साक्ष्य स्थानीय रूप से कतारबद्ध रहते हैं।',
    enforcement: 'प्रवर्तन /',
    captureDesk: 'फील्ड डेस्क',
    supervisorOverview: 'सुपरवाइज़र अवलोकन',
    statutoryHub: 'विधिक ज्ञान केंद्र',
    evidenceDetail: 'साक्ष्य विवरण',
    syncStable: 'सिंक सुरक्षित',
    switchRole: 'पद व पहुंच बदलें',

    // Status Pills & Badges
    compliant: 'अनुपालन पूर्ण (Compliant)',
    violation: 'उल्लंघन (Violation)',
    pendingReview: 'समीक्षा लंबित (Pending)',

    // Home / Capture Desk
    fieldDeskBadge: 'फील्ड डेस्क',
    heroTitle: 'आत्मविश्वास से निरीक्षण करें।',
    heroAccent: 'जो आवश्यक है, रिकॉर्ड करें।',
    heroSub: 'हर पैकेज्ड वस्तु का स्पष्ट व न्यायालय-मान्य रिकॉर्ड — प्रथम फोटो कैप्चर से लेकर अंतिम सबमिशन तक।',
    evidenceWorkflow: 'साक्ष्य-प्राथमिक कार्यप्रणाली',
    intermittentNetwork: 'कम या बिना नेटवर्क पर भी सक्षम',
    openSupervisorView: 'सुपरवाइज़र दृश्य खोलें',
    startNewInspection: 'नया निरीक्षण प्रारंभ करें',
    scanBarcode: 'बारकोड स्कैन करें',
    startScan: 'कैमरा स्कैन शुरू करें',
    readyWhenYouAre: 'निरीक्षण के लिए तैयार',
    readySub: 'पैकेज की तस्वीर लें, लेबल विवरण सत्यापित करें, और एक मिनट से कम समय में सुरक्षित साक्ष्य दर्ज करें।',
    beginCapture: 'कैप्चर प्रारंभ करें',
    captureModeActive: 'कैप्चर मोड सक्रिय',
    enterWhatLabelTells: 'पैकेज लेबल पर अंकित जानकारी दर्ज करें।',
    cancel: 'रद्द करें',
    productName: 'उत्पाद का नाम',
    category: 'उत्पाद श्रेणी',
    location: 'निरीक्षण स्थल',
    labelText: 'लेबल पाठ (पैकेज पर मुद्रित घोषणाएं)',
    labelTextHint: 'या स्वचालित रूप से लेबल पढ़ने के लिए फोटो संलग्न करें।',
    capturedEvidence: 'संलग्न पैकेज चित्र (साक्ष्य)',
    capturePhoto: 'फोटो खींचे / अपलोड करें',
    removePhoto: 'फोटो हटाएं',
    readingLabel: 'लेबल पाठ पढ़ा जा रहा है (OCR)…',
    saveAndAnalyze: 'सुरक्षित करें व नियम जांचें',
    savingScan: 'नियम अनुपालन जांच जारी…',
    recentScans: 'हालिया निरीक्षण',
    recentScansSub: 'इस कार्यक्षेत्र में दर्ज किए गए भौतिक व ऑनलाइन लेबल स्कैन।',
    searchPlaceholder: 'निरीक्षण खोजें…',
    filterAll: 'सभी',
    filterCompliant: 'अनुपालित',
    filterViolation: 'उल्लंघन',
    filterPending: 'लंबित',
    noScansYet: 'अभी तक कोई निरीक्षण दर्ज नहीं हुआ',
    noScansSub: 'नया निरीक्षण दर्ज करने के लिए ऊपर दिए गए बटन का उपयोग करें।',
    reviewBannerTitle: 'निरीक्षण सफलतापूर्वक कैप्चर किया गया',
    reviewBannerSub: 'विधिक मापविज्ञान नियम, 2011 के तहत अनिवार्य घोषणाओं का स्वचालित सत्यापन।',
    submitToSupervisor: 'सुपरवाइज़र कतार में जमा करें',
    submitting: 'जमा किया जा रहा है…',
    viewDetails: 'पूर्ण रिपोर्ट देखें',

    // Categories
    catFood: 'पैकेज्ड खाद्य पदार्थ',
    catPersonalCare: 'व्यक्तिगत देखभाल (Cosmetics)',
    catHousehold: 'घरेलू उत्पाद',
    catElectrical: 'इलेक्ट्रिकल उपकरण',
    catOther: 'अन्य वस्तुएं',

    // Dashboard
    supervisorToday: 'सुपरवाइज़र कंसोल / आज की स्थिति',
    dayAtGlance: 'दिन का समग्र अवलोकन।',
    dayAtGlanceSub: 'फील्ड गतिविधियों, दर्ज उल्लंघनों, और समीक्षा हेतु लंबित साक्ष्यों का संक्षिप्त दृश्य।',
    recordsInRepo: 'रजिस्टर में कुल रिकॉर्ड्स',
    allCapturedEvidence: 'सभी संकलित साक्ष्य',
    complianceRate: 'अनुपालन दर',
    basedOnSubmitted: 'सत्यापित जांचों के आधार पर',
    productsTracked: 'ट्रैक किए गए उत्पाद',
    distinctCommodities: 'विभिन्न जांची गई वस्तुएं',
    queuedOffline: 'ऑफ़लाइन कतार',
    waitingConnection: 'कनेक्शन की प्रतीक्षा में',
    recentAuditActivity: 'हालिया ऑडिट गतिविधि',
    newScan: 'नया स्कैन',
    violationBreakdown: 'उल्लंघन वर्गीकरण',
    noFailedDeclarations: 'कोई उल्लंघन दर्ज नहीं है — रजिस्टर पूरी तरह स्वच्छ है।',
    attentionQueue: 'प्राथमिकता कतार',
    exceptionsToReview: 'समीक्षा हेतु लंबित मामले',
    topViolationSignal: 'प्रमुख उल्लंघन संकेत',
    needsAttention: 'तत्काल ध्यान दें',
    allClear: 'वर्तमान में सब स्पष्ट है',
    allClearSub: 'आज की स्ट्रीम में कोई अनिर्णीत अपवाद नहीं है।',
    lastSync: 'अंतिम सिंक',
    allDevicesChecked: 'सभी फील्ड उपकरणों से हाल ही में डेटा प्राप्त हुआ।',

    // Products Repository
    complianceRepo: 'अनुपालन रजिस्टर',
    everyProductOneHistory: 'प्रत्येक उत्पाद, एक समग्र इतिहास।',
    everyProductSub: 'स्कैन की गई वस्तुओं का उत्पादवार वर्गीकरण — संपूर्ण निरीक्षण इतिहास के साथ, जिससे बार-बार उल्लंघन करने वालों की पहचान आसान हो।',
    recordsCount: 'रिकॉर्ड्स',
    productsCount: 'उत्पाद',
    violationsCount: 'उल्लंघन',
    searchProductsPlaceholder: 'उत्पाद रजिस्टर में खोजें…',
    inspections: 'निरीक्षण',
    firstSeen: 'प्रथम अवलोकन',
    repeatOffenderWarning: 'पुनरावृत्ति चेतावनी — पूर्व निरीक्षणों में इस उत्पाद पर उल्लंघन पाए गए थे',
    emptyRepoTitle: 'रजिस्टर रिक्त है',
    emptyRepoSub: 'फील्ड डेस्क पर स्कैन किए गए उत्पाद यहां उनके अनुपालन इतिहास के साथ प्रदर्शित होंगे।',
    productHistoryBuiltAutomatically: 'स्थानीय रजिस्टर से उत्पाद इतिहास स्वतः तैयार होता है। पूर्ण साक्ष्य विवरण, जांच और पीडीएफ रिपोर्ट देखने के लिए कोई भी निरीक्षण खोलें।',

    // E-Commerce
    ecommerceTitle: 'डिजिटल उत्पाद लिस्टिंग का ऑडिट',
    ecommerceSub: 'सत्यापित करें कि ई-कॉमर्स प्लेटफॉर्म नियम 6(10) के तहत बिक्री से पूर्व सभी अनिवार्य विधिक घोषणाएं प्रदर्शित कर रहे हैं।',
    ecommerceUrlLabel: 'ई-कॉमर्स उत्पाद URL (Amazon, Flipkart, आदि)',
    ecommerceUrlPlaceholder: 'https://www.amazon.in/dp/... या https://www.flipkart.com/...',
    auditListing: 'लिस्टिंग अनुपालन जांचें',
    auditing: 'ऑडिट जारी है…',
    pasteUrlHint: 'डिजिटल पैकेजिंग अनुपालन की जांच के लिए उत्पाद लिंक दर्ज करें।',

    // Scan Detail
    backToScans: 'स्कैन सूची पर वापस जाएं',
    evidenceRecord: 'साक्ष्य रिकॉर्ड',
    noImageAttached: 'कोई पैकेज चित्र संलग्न नहीं है',
    noImageSub: 'नीचे दिया गया संरचित लेबल ट्रांसक्रिप्शन इस साक्ष्य रिकॉर्ड का अभिन्न भाग है।',
    reviewTrail: 'समीक्षा विवरण',
    complianceChecks: 'नियम अनुपालन जांच',
    machineTranscription: 'मशीन ट्रांसक्रिप्शन (OCR)',
    labelTextCaptured: 'कैप्चर किया गया लेबल पाठ',
    noOcrText: 'इस स्कैन के लिए कोई OCR पाठ दर्ज नहीं किया गया।',
    enforcementNoticeTitle: 'प्रवर्तन नोटिस व जब्ती मेमो (नियम 19-21)',
    copyNoticeMemo: 'नोटिस मेमो कॉपी करें',
    copied: 'कॉपी हो गया',
    enforcementNoticeDesc: 'विधिक मापविज्ञान अधिनियम, 2009 की धारा 36 के तहत वैधानिक उल्लंघन पाया गया। जब्ती मेमो तैयार करने या नियम 32A के तहत कंपाउंडिंग हेतु यह सारांश कॉपी करें।',
    recordControls: 'रिकॉर्ड नियंत्रण व रिपोर्ट',
    inspectionReports: 'निरीक्षण रिपोर्ट',
    submittedToRegister: 'रजिस्टर में दर्ज',
    awaitingSubmission: 'सबमिशन की प्रतीक्षा',
    evidenceHashLabel: 'साक्ष्य हैश (SHA-256)',
    downloadPdfReport: 'न्यायालय-मान्य PDF रिपोर्ट डाउनलोड करें',
    exportCsv: 'CSV निर्यात (स्प्रेडशीट)',
    exportJson: 'JSON निर्यात (डेटा)',
    submitEvidenceToRegister: 'रजिस्टर में साक्ष्य सबमिट करें',
    deleteRecord: 'प्रविष्टि हटाएं',
    deleteConfirm: 'क्या आप वाकई इस निरीक्षण रिकॉर्ड को हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।',
    deleting: 'हटाया जा रहा है…',
    recordDeleted: 'रिकॉर्ड सफलतापूर्वक हटा दिया गया।',
    deleteProductAll: 'उत्पाद और पूरा इतिहास हटाएं',
    deleteProductConfirm: 'क्या आप वाकई इस उत्पाद के सभी निरीक्षण रिकॉर्ड हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।',

    // Statutory Declarations Keys
    declMrp: 'अधिकतम खुदरा मूल्य (MRP)',
    declUsp: 'इकाई विक्रय मूल्य (USP)',
    declQty: 'शुद्ध मात्रा व SI इकाइयाँ',
    declDate: 'विनिर्माण / पैकिंग तिथि',
    declContact: 'उपभोक्ता देखरेख संपर्क',
    declPacker: 'निर्माता / पैकर विवरण',
    declOrigin: 'मूल देश (Country of Origin)',
    declPlacement: 'घोषणा स्थान निर्धारण',
    declFont: 'फ़ॉन्ट आकार विधिक न्यूनतम',
    declReadability: 'मुद्रण पठनीयता स्तर',
    declExemption: 'नियम 26 विधिक छूट',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'parakh.language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
  };

  const t = DICTIONARY[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}

export function getTranslatedCheckLabel(key: string, defaultLabel: string, t: Translations): string {
  switch (key) {
    case 'mrp': return t.declMrp;
    case 'unit_sale_price': return t.declUsp;
    case 'net_quantity': return t.declQty;
    case 'consumer_care': return t.declContact;
    case 'manufacturer_packer': return t.declPacker;
    case 'date_marking': return t.declDate;
    case 'country_of_origin': return t.declOrigin;
    case 'declaration_placement': return t.declPlacement;
    case 'font_size': return t.declFont;
    case 'readability': return t.declReadability;
    case 'rule26_exemption': return t.declExemption;
    default: return defaultLabel;
  }
}

export function getTranslatedCheckStatus(status: string, language: Language): string {
  if (language === 'hi') {
    if (status === 'passed') return 'सत्यापित';
    if (status === 'failed') return 'उल्लंघन';
    if (status === 'review') return 'समीक्षा आवश्यक';
    return status;
  }
  return status;
}

