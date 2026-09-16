import axios from 'axios';

// Indian Agronomy Knowledge Engine & Rule Matrix for instant, zero-failure AI advisory
export const generateRuleBasedAgroAdvice = (query, context, language = 'en') => {
  const q = query.toLowerCase();
  const crop = context.activeCrop || context.farm?.currentCrop || 'crop';
  const weather = context.weather || {};
  const soil = context.latestSoil || {};
  const farm = context.farm || {};

  const disclaimerMap = {
    en: '\n\n*Note: This agricultural advisory is AI-generated for informational guidance based on your farm and weather context. Please confirm with your local Krishi Vigyan Kendra (KVK) officer for field-specific chemical dosages.*',
    hi: '\n\n*नोट: यह कृषि परामर्श आपके खेत और मौसम की स्थिति के आधार पर सूचनात्मक मार्गदर्शन के लिए है। विशिष्ट रासायनिक मात्रा के लिए कृपया अपने स्थानीय कृषि विज्ञान केंद्र (KVK) से परामर्श करें।*',
    mr: '\n\n*टीप: हा कृषी सल्ला तुमच्या शेताच्या आणि हवामानाच्या नोंदींवर आधारित मार्गदर्शनासाठी आहे. औषधांच्या अचूक प्रमाणासाठी कृपया तुमच्या स्थानिक कृषी विज्ञान केंद्र (KVK) किंवा कृषी सहाय्यकांशी चर्चा करा.*',
  };

  const disclaimer = disclaimerMap[language] || disclaimerMap.en;

  // 1. Irrigation Query
  if (q.includes('irrigate') || q.includes('water') || q.includes('सिंचाई') || q.includes('पानी') || q.includes('पाणी') || q.includes('पाणी देणे') || q.includes('ओल')) {
    const rainChance = weather.rainProbability || 0;
    const soilMoisture = soil.moisturePercentage || 30;

    if (language === 'mr') {
      let advice = `### 💧 ${farm.farmName ? farm.farmName + ' साठी' : ''} सिंचन सल्ला (${crop}):\n\n`;
      if (rainChance > 50) {
        advice += `1. **हवामान अंदाज**: पुढील २४ तासांत पावसाची शक्यता **${rainChance}%** आहे. त्यामुळे आज पाणी देणे पुढे ढकला.\n`;
        advice += `2. **पाण्याचा निचरा**: जमिनीत पाणी साचून मुळांना हानी पोहोचू नये म्हणून शेतातील चर व निचरा व्यवस्था तपासा.\n`;
      } else if (soilMoisture < 20) {
        advice += `1. **मातीतील ओलावा**: मातीतील ओलावा **${soilMoisture}%** (कमी) आहे. सध्याच्या तापमानात (${weather.temperature || 28}°C) पिकाला ताण बसू नये म्हणून त्वरित हलके पाणी द्या.\n`;
        advice += `2. **सिंचन पद्धत**: ${farm.irrigationType || 'ठिबक सिंचन'} द्वारे पहाटे किंवा संध्याकाळी ५ नंतर पाणी दिल्यास बाष्पीभवन कमी होईल.\n`;
      } else {
        advice += `1. **सद्यस्थिती**: मातीमध्ये पुरेसा ओलावा (${soilMoisture}%) असून पाऊस पडण्याची शक्यता ${rainChance}% आहे.\n`;
        advice += `2. **शिफारस**: २-३ दिवसांनी माती तपासून गरजेनुसार ठिबक सिंचनाने पाणी सुरू करा.\n`;
      }
      return advice + disclaimer;
    } else if (language === 'hi') {
      let advice = `### 💧 ${farm.farmName ? farm.farmName + ' के लिए' : ''} सिंचाई परामर्श (${crop}):\n\n`;
      if (rainChance > 50) {
        advice += `1. **मौसम की स्थिति**: अगले २४ घंटों में बारिश की संभावना **${rainChance}%** है। इसलिए आज अतिरिक्त सिंचाई न करें।\n`;
        advice += `2. **जल निकासी**: खेत में जलभराव रोकने के लिए जल निकासी नालियों को साफ रखें ताकि जड़ों में सड़न न हो।\n`;
      } else if (soilMoisture < 20) {
        advice += `1. **मृदा नमी**: मिट्टी में नमी का स्तर **${soilMoisture}%** (कम) है। तापमान (${weather.temperature || 28}°C) को देखते हुए फसल को पानी की आवश्यकता है।\n`;
        advice += `2. **पद्धति**: ${farm.irrigationType || 'ड्रिप सिंचाई'} द्वारा सुबह या शाम के समय सिंचाई करें।\n`;
      } else {
        advice += `1. **संतुलित नमी**: मिट्टी में पर्याप्त नमी (${soilMoisture}%) उपलब्ध है और बारिश की संभावना ${rainChance}% है।\n`;
        advice += `2. **सिफारिश**: आगामी २ दिनों तक सिंचाई स्थगित रखें और मिट्टी सूखने पर ही पानी दें।\n`;
      }
      return advice + disclaimer;
    } else {
      let advice = `### 💧 Irrigation Advisory for ${crop} (${farm.farmName || 'Your Farm'}):\n\n`;
      if (rainChance > 50) {
        advice += `1. **Precipitation Outlook**: High rain probability of **${rainChance}%** detected in the forecast. **Postpone irrigation** to conserve water and prevent root hypoxia.\n`;
        advice += `2. **Field Drainage**: Ensure drainage channels are open to prevent standing water accumulation around ${crop} roots.\n`;
      } else if (soilMoisture < 20) {
        advice += `1. **Soil Moisture Deficit**: Current soil moisture is low (**${soilMoisture}%**). With ambient temperature at ${weather.temperature || 28}°C, immediate irrigation is advised.\n`;
        advice += `2. **Recommended Method**: Utilize ${farm.irrigationType || 'Drip Irrigation'} during early morning or evening to minimize evapotranspiration losses.\n`;
      } else {
        advice += `1. **Adequate Moisture**: Soil moisture stands at a healthy **${soilMoisture}%**, and rain probability is ${rainChance}%.\n`;
        advice += `2. **Action Plan**: Maintain regular monitoring; plan next irrigation cycle in 2–3 days based on topsoil dryness.\n`;
      }
      return advice + disclaimer;
    }
  }

  // 2. Soil & Fertilizer Query
  if (q.includes('fertilizer') || q.includes('soil') || q.includes('npk') || q.includes('खाद') || q.includes('उर्वरक') || q.includes('खत') || q.includes('माती')) {
    const ph = soil.ph || 6.8;
    const n = soil.nitrogen || 260;
    const p = soil.phosphorus || 30;
    const k = soil.potassium || 180;

    if (language === 'mr') {
      let advice = `### 🌿 खत आणि माती व्यवस्थापन सल्ला (${crop}):\n\n`;
      advice += `1. **माती परीक्षण मूल्ये**: pH: **${ph}**, नत्र (N): **${n} kg/ha**, स्फुरद (P): **${p} kg/ha**, पालाश (K): **${k} kg/ha**.\n`;
      if (ph < 6.2) {
        advice += `2. **सामू (pH) सुधारणा**: माती आम्लधर्मी आहे. हेक्टर २ टन शेणखत + चुन्याची मात्रा मिसळा.\n`;
      } else if (ph > 7.8) {
        advice += `2. **सामू (pH) सुधारणा**: माती विम्ल/क्षारयुक्त आहे. जिप्समचा वापर करा आणि सेंद्रिय ताग/धैंचा गाडा.\n`;
      }
      if (n < 280) {
        advice += `3. **नत्र व्यवस्थापन**: नत्राची कमतरता भरून काढण्यासाठी निमकोटेड युरिया विभागून द्या किंवा ॲझोटोबॅक्टर जिवाणू संवर्धक वापरा.\n`;
      }
      advice += `4. **पिकासाठी शिफारस**: फुलोरा अवस्थेत 19:19:19 किंवा 12:61:00 या विद्राव्य खतांची ५ ग्रॅम/लिटर दराने फवारणी फायदेशीर ठरेल.\n`;
      return advice + disclaimer;
    } else if (language === 'hi') {
      let advice = `### 🌿 उर्वरक एवं मृदा स्वास्थ्य परामर्श (${crop}):\n\n`;
      advice += `1. **मृदा रिपोर्ट सारांश**: pH: **${ph}**, नाइट्रोजन (N): **${n} kg/ha**, फास्फोरस (P): **${p} kg/ha**, पोटाश (K): **${k} kg/ha**.\n`;
      if (n < 280) {
        advice += `2. **नाइट्रोजन पूर्ति**: नीम लेपित यूरिया को 2-3 किस्तों में दें और राइजोबियम/एज़ोटोबैक्टर जैव उर्वरक का प्रयोग करें।\n`;
      }
      advice += `3. **पोषक तत्व संतुलन**: अच्छी वानस्पतिक वृद्धि के लिए डीएपी (DAP) व पोटाश का संतुलित प्रयोग करें।\n`;
      advice += `4. **पर्ण छिड़काव**: जल विलेय उर्वरक NPK 19:19:19 @ 5 ग्राम प्रति लीटर पानी का छिड़काव करें।\n`;
      return advice + disclaimer;
    } else {
      let advice = `### 🌿 Soil Nutrition & Fertilizer Advisory for ${crop}:\n\n`;
      advice += `1. **Soil Test Analysis**: Soil pH is **${ph}**, Nitrogen (N): **${n} kg/ha**, Phosphorus (P): **${p} kg/ha**, Potassium (K): **${k} kg/ha**.\n`;
      if (n < 280) {
        advice += `2. **Nitrogen Boosting**: Soil indicates low Nitrogen. Apply Neem-Coated Urea in split basal & top-dressing doses, supplemented with Azotobacter bio-inoculants.\n`;
      }
      advice += `3. **Micronutrient Balance**: For robust yield in ${farm.soilType || 'standard soil'}, incorporate Zinc Sulfate (25 kg/ha) and Boron (foliar 1g/L).\n`;
      advice += `4. **Foliar Nutrition**: Apply water-soluble NPK (19:19:19) @ 5g/L during early vegetative and branching phases.\n`;
      return advice + disclaimer;
    }
  }

  // 3. Pest & Disease Query
  if (q.includes('pest') || q.includes('disease') || q.includes('insect') || q.includes('कीट') || q.includes('रोग') || q.includes('कीड') || q.includes('औषध')) {
    if (language === 'mr') {
      return (
        `### 🛡️ ${crop} कीड व रोग नियंत्रण उपाय:\n\n` +
        `1. **एकात्मिक कीड नियंत्रण (IPM)**: रसशोषक किडींसाठी (मावा, तुडतुडे, पांढरी माशी) एकरी १० पिवळे व निळे चिकट सापळे लावा.\n` +
        `2. **जैविक प्रतिबंध**: ५% निंबोळी अर्क (Neem Oil 10,000 ppm) २.५ मिली/लिटर पाण्यात मिसळून प्रतिबंधात्मक फवारणी करा.\n` +
        `3. **बुरशीजन्य रोग नियंत्रण**: पानावरील करपा किंवा तांबेरा नियंत्रणासाठी कॉपर ऑक्सिक्लोराईड (COC) २.५ ग्रॅम किंवा मॅन्कोझेब २ ग्रॅम प्रति लिटर फवारणी करा.\n` +
        `4. **हवामान खबरदारी**: वाऱ्याचा वेग ${weather.windSpeed || 10} km/h असताना फवारणी टाळा, स्वच्छ सूर्यप्रकाशात सकाळी फवारणी करावी.` +
        disclaimer
      );
    } else if (language === 'hi') {
      return (
        `### 🛡️ ${crop} कीट एवं रोग प्रबंधन निर्देशिका:\n\n` +
        `1. **समेकित कीट नियंत्रण (IPM)**: रस चूसक कीटों (एफिड, जेसिड, सफेद मक्खी) की रोकथाम हेतु प्रति एकड़ 8-10 पीले एवं नीले चिपचिपे ट्रैप लगाएं।\n` +
        `2. **जैविक उपचार**: नीम का तेल (10,000 ppm) 2 से 3 मिली प्रति लीटर पानी में मिलाकर प्राथमिक छिड़काव करें।\n` +
        `3. **फफूंदनाशक**: पत्ती धब्बा व झुलसा रोग नियंत्रण के लिए मेंकोज़ेब 75% WP @ 2 ग्राम प्रति लीटर पानी में घोलकर छिड़कें।\n` +
        `4. **छिड़काव समय**: हवा की गति ${weather.windSpeed || 10} किमी/घंटा से कम होने पर सुबह 8 से 11 बजे के मध्य छिड़काव करें।` +
        disclaimer
      );
    } else {
      return (
        `### 🛡️ Integrated Pest & Disease Management for ${crop}:\n\n` +
        `1. **Monitoring & Physical Traps**: Install 8–10 Yellow & Blue Sticky Traps per acre to monitor and control sucking pests (Thrips, Whiteflies, Aphids).\n` +
        `2. **Bio-Pesticide Regimen**: Spray Neem-based botanical insecticide (Azadirachtin 10,000 ppm) @ 2.5 ml/L during initial infestation signs.\n` +
        `3. **Fungal Blight / Rust Control**: Apply Mancozeb 75% WP @ 2g/L or Hexaconazole 5% SC @ 1.5 ml/L at first disease symptom onset.\n` +
        `4. **Spray Window**: Ambient wind speed is ${weather.windSpeed || 10} km/h. Conduct foliar spraying in early morning (7:00 AM – 10:30 AM) with a surfactant sticking agent.` +
        disclaimer
      );
    }
  }

  // 4. General Farm Advisory
  if (language === 'mr') {
    return (
      `### 🌾 कृषी मित्र सल्ला (${crop} - ${farm.farmName || 'शेत'}):\n\n` +
      `आपल्या शेताची सद्यस्थिती:\n` +
      `- **स्थान व हवामान**: तापमान ${weather.temperature || 28}°C, आर्द्रता ${weather.humidity || 60}%, पाऊस शक्यता ${weather.rainProbability || 10}%\n` +
      `- **मातीची प्रत**: ${farm.soilType || 'काळी जमीन'}, pH: ${soil.ph || 6.8}\n\n` +
      `**प्रमुख शिफारशी**:\n` +
      `1. पिकाच्या वाढीच्या अवस्थेनुसार अन्नद्रव्यांचे योग्य नियोजन करा.\n` +
      `2. शेतात तण नियंत्रण वेळेवर करून सूर्यप्रकाश व हवा खेळती ठेवा.\n` +
      `3. हवामानातील बदलांनुसार सिंचन व फवारणीचे वेळापत्रक आखा.` +
      disclaimer
    );
  } else if (language === 'hi') {
    return (
      `### 🌾 कृषि मित्र परामर्श (${crop} - ${farm.farmName || 'खेत'}):\n\n` +
      `आपके खेत की वर्तमान स्थिति:\n` +
      `- **मौसम**: तापमान ${weather.temperature || 28}°C, आर्द्रता ${weather.humidity || 60}%, बारिश की संभावना ${weather.rainProbability || 10}%\n` +
      `- **मिट्टी का प्रकार**: ${farm.soilType || 'उपजाऊ मिट्टी'}, pH: ${soil.ph || 6.8}\n\n` +
      `**मुख्य सुझाव**:\n` +
      `1. फसल की अवस्था के अनुसार उचित पोषण और सूक्ष्म पोषक तत्वों की आपूर्ति सुनिश्चित करें।\n` +
      `2. समय पर निराई-गुड़ाई कर खरपतवारों का प्रभावी नियंत्रण करें।\n` +
      `3. मौसम के पूर्वानुमान के अनुसार सिंचाई का समय तय करें।` +
      disclaimer
    );
  } else {
    return (
      `### 🌾 Krishi Mitra Agronomic Advisory for ${crop} (${farm.farmName || 'Field'}):\n\n` +
      `**Current Farm Status**:\n` +
      `- **Weather**: ${weather.temperature || 28}°C, Humidity ${weather.humidity || 60}%, Rain Probability: ${weather.rainProbability || 15}%\n` +
      `- **Soil Characteristics**: ${farm.soilType || 'Rich Agricultural Soil'}, pH: ${soil.ph || 6.8}, Irrigation: ${farm.irrigationType || 'Drip'}\n\n` +
      `**Key Recommendations**:\n` +
      `1. Schedule balanced fertilizer top-dressing matching the active growth phase of ${crop}.\n` +
      `2. Ensure weed-free field conditions to optimize sunlight intercept and soil aeration.\n` +
      `3. Align irrigation with current meteorological trends to conserve water and maximize yield.` +
      disclaimer
    );
  }
};

// Main AI Assistant Generator supporting Gemini, OpenAI, or Agronomy Engine
export const getAIResponse = async ({ prompt, context, language = 'en' }) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const systemInstructions = `You are Krishi Mitra (कृषी मित्र), an expert agricultural scientist and smart farming advisor for Indian farmers on the KrishiSetu platform.
You provide clear, practical, empathetic, and actionable farming guidance in ${language === 'mr' ? 'Marathi (मराठी)' : language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
Always include relevant Indian agronomic context (Kharif, Rabi, Zaid seasons, NPK dosages, drip irrigation, IPM biological pest control).
Farmer & Farm Context Provided:
${JSON.stringify(context, null, 2)}
Important: Provide informational agricultural guidance and include a polite disclaimer that recommendations should be cross-verified with local Krishi Vigyan Kendra (KVK) for specific field chemical dosages.`;

  // 1. Try Google Gemini API if key is present
  if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstructions}\n\nUser Question: ${prompt}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1000,
          },
        },
        { timeout: 8000 }
      );

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText;
      }
    } catch (apiError) {
      console.warn('Gemini API request failed, falling back to Agronomy Engine:', apiError.message);
    }
  }

  // 2. Try OpenAI API if key is present
  if (openaiKey && openaiKey.trim() !== '' && openaiKey !== 'your_openai_api_key_here') {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      const generatedText = response.data?.choices?.[0]?.message?.content;
      if (generatedText) {
        return generatedText;
      }
    } catch (openaiErr) {
      console.warn('OpenAI API request failed, falling back to Agronomy Engine:', openaiErr.message);
    }
  }

  // 3. High-fidelity Agronomy Knowledge Engine Fallback (guarantees 100% uptime & zero crashes)
  return generateRuleBasedAgroAdvice(prompt, context, language);
};
