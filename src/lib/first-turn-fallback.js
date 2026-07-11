function cleanIntent(intent = '') {
    return String(intent || '')
        .replace(/\s+/g, ' ')
        .replace(/^["'`]+|["'`.!?]+$/g, '')
        .trim()
        .slice(0, 150);
}

function hasExplicitSecret(intent = '') {
    return [
        /\bsk-(?:ant|proj|live|test|[a-z0-9])[a-z0-9_-]{16,}\b/i,
        /\b(?:api[_-]?key|secret|token|password|passcode|private[_-]?key)\s*[:=]\s*\S{6,}/i,
        /\b(?:my|the)\s+(?:password|passcode|otp|pin|token|api key|secret)\s+(?:is|=|:)\s*\S{4,}/i,
        /-----BEGIN [A-Z ]*PRIVATE KEY-----/i,
    ].some((pattern) => pattern.test(intent));
}

function isExecutionDriftText(text = '') {
    const value = String(text || '').toLowerCase();
    const overload = /\b(do it all|all now|build everything|everything at once|every feature|what else should we add|best ai product|site,\s*mobile|model router|deployment)\b/.test(value);
    const productScope = /\b(site|homepage|mobile|enterprise|memory|research|visuals?|model router|deployment|agents?|ads?|browser runtime|product|features?)\b/.test(value);
    return overload && productScope;
}

function needsSourceCheck(text = '') {
    if (isExecutionDriftText(text)) return false;

    const explicitSourceAsk = /\b(2026|this year|recently|right now|current|latest|online|web|source|sources|research|competitor|market|verify|check|paper|study|studies|report|pricing|released|launched|who is doing)\b/.test(text);
    const timedFactAsk = /\b(today|right now|this week|this month|this year|as of)\b/.test(text)
        && /\b(news|market|price|pricing|competitor|research|source|verify|check|fact|facts|numbers|paper|study|studies|report|released|launched|happened|weather|stock|model|api)\b/.test(text);

    return explicitSourceAsk || timedFactAsk;
}

function isUnderSpecifiedIntent(text = '') {
    if (!text) return false;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length > 5) return false;
    if (/\b(make|create|build|write|draft|send|decide|choose|fix|repair|understand|explain|check|verify|research|compare|plan|launch|ship|test|learn)\b/.test(text)) {
        return false;
    }
    return /\b(website|business|money|career|idea|work|project|product|app|portfolio|content|strategy|relationship|habit|focus|school|job|life)\b/.test(text);
}

function classify(intent = '') {
    const text = cleanIntent(intent).toLowerCase();
    if (hasExplicitSecret(intent)) {
        return 'private_output';
    }
    if (/\b(models?|browser|ai apps?|apple|memory|genui)\b.*\bnow\b/.test(text)) {
        return 'source_check';
    }
    if (isExecutionDriftText(text)) {
        return 'reset';
    }
    if (needsSourceCheck(text)) {
        return 'source_check';
    }
    if (!/\b(switch|whether|between|decid\w*|should i|should we|do i)\b/.test(text) && /\b(landing page|homepage|site|page)\b/.test(text) && /\b(brainscan|mirrorseed|enterprise|too much|first action|first screen|users?|button|copy|ads?)\b/.test(text)) {
        return 'launch_clarity';
    }
    if (/^should\b/.test(text) || /\b(decide|decision|choice|choos(?:e|ing)|between|whether|worth pursuing|pursue|do not know if|don't know if|should i|should we|should\b.*\bor\b|do i\b.*\bor\b|or switch|commit|quit|stay or leave|leave or stay)\b/.test(text)) {
        return 'decision';
    }
    if (/\b(real secret|actual secret|password|passcode|private key|api key|access token|otp|pin|credential)\b/.test(text)) {
        return 'private_output';
    }
    if (/\b(don'?t know what to ask|do not know what to ask|not sure what to ask|where do i start|how do i start|what should i ask|don'?t know where to start|do not know where to start)\b/.test(text)) {
        return 'start_help';
    }
    if (/\b(hallucinat\w*|overreach\w*|overthink\w*|drift\w*)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(site|page|product|homepage|copy|marketing|sales|sell|ads?|positioning|offer|user|customer|demo|public|proof|reflection|receipts?|systems?|first use|first-use|ritual|onboarding)\b/.test(text)) {
        return 'launch_clarity';
    }
    if (/\b(hallucinat\w*|overthink\w*|overwhelmed|scattered|spiral\w*|circles|too much|lost|losing the thread|too many ideas|cannot pick|can't pick|what else|lock\w* the next thing|less clear|feels urgent|feels obvious|adding tools|anxious|panic|tired|drift|drifting|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text) || /\b(i feel|i am|i'm|we are|we're)\b.*\b(confused|stuck|lost)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(overwhelmed|scattered|confused|lost|losing the thread|too many ideas|cannot pick|can't pick|what else|lock\w* the next thing|less clear|feels urgent|feels obvious|adding tools|stuck|spiral\w*|circles|loop|too much|drift|drifting|anxious|panic|tired|fast-moving|nonlinear)\b/.test(text) || /\b(thoughts?|mind)\b.*\b(moving fast|too fast|racing|all over)\b/.test(text)) {
        return 'reset';
    }
    if (/\b(draft|write|document|memo|email|pdf|deck|file|artifact|output|useful)\b/.test(text)) {
        return 'artifact';
    }
    if (isUnderSpecifiedIntent(text)) {
        return 'needs_detail';
    }
    return 'general';
}

const MIRRORS = {
    source_check: {
        reflection: 'This needs checking before it shapes your next move.',
        question: 'Which claim would change what you do if it were wrong?',
        move: 'Check one current source, then use only what changed.',
    },
    private_output: {
        reflection: 'Leave the exact private details out. I can still help with the useful version.',
        question: 'What should the public version help the reader do?',
        move: 'Replace names, keys, or account details with [name], [secret], or [detail], then send the version you can share.',
    },
    needs_detail: {
        reflection: 'Give me one direction and I can start.',
        question: 'Make, decide, fix, or understand?',
        move: 'Pick one word, then add one sentence about the thing.',
    },
    launch_clarity: {
        reflection: 'The first screen should make one useful action obvious before anything else asks for attention.',
        question: 'What should someone try in the first thirty seconds?',
        move: 'Pick one promise and one button. Hide anything that competes with them.',
    },
    decision: {
        reflection: 'Another opinion will not help as much as one real signal.',
        question: 'What signal would make one option easier to choose?',
        move: 'Name the signal, then run the smallest test you can run today.',
    },
    reset: {
        reflection: 'There are too many things open. Make one of them lighter first.',
        question: 'Which one would make today easier?',
        move: 'Pick that one, set a ten-minute timer, and do the smallest visible step.',
    },
    artifact: {
        reflection: 'This wants to become something you can use.',
        question: 'What output would still be useful if it were rough?',
        move: 'Draft the smallest usable version with a title, three bullets, and one ask.',
    },
    start_help: {
        reflection: 'Start with one thing. Make it, decide it, fix it, or understand it.',
        question: '',
        move: 'Pick one below, or type one messy sentence.',
    },
    general: {
        reflection: 'This is wide enough to get heavy. Make the first version small.',
        question: 'What would make today feel a little easier?',
        move: 'Write one sentence that names the result you want by tonight.',
    },
};

const LANGUAGE_MIRRORS = {
    hi: {
        needs_detail: {
            reflection: 'एक दिशा बता दीजिए, मैं वहीं से शुरू करूँगा।',
            question: 'बनाना है, तय करना है, ठीक करना है, या समझना है?',
            move: 'एक विकल्प चुनिए, फिर उसके बारे में एक साफ़ वाक्य लिखिए।',
        },
        general: {
            reflection: 'यह अभी थोड़ा बड़ा है। इसे इतना छोटा करते हैं कि आज आगे बढ़ सके।',
            question: 'आज आज़माने लायक इसका सबसे छोटा रूप क्या है?',
            move: 'उसे एक वाक्य में लिखिए, फिर किसी एक व्यक्ति को दिखाइए।',
        },
    },
    hinglish: {
        source_check: {
            reflection: 'Is par banane se pehle ek current source check zaroori hai.',
            question: 'Kaunsa claim galat nikla to aapka next step badal jayega?',
            move: 'Us ek claim ko likhiye, phir use ek current source se check kijiye.',
        },
        private_output: {
            reflection: 'Main useful part mein madad kar sakta hoon. Real secret bahar rakhiye.',
            question: 'Aap mujhse kya banwana, decide karwana, ya fix karwana chahte hain?',
            move: 'Dobara bhejiye, real value ki jagah [secret] ya [detail] likh kar.',
        },
        needs_detail: {
            reflection: 'Ek direction de dijiye, main start kar sakta hoon.',
            question: 'Banana hai, decide karna hai, fix karna hai, ya samajhna hai?',
            move: 'Ek option chuniye, phir ek sentence aur add kijiye.',
        },
        launch_clarity: {
            reflection: 'First screen par ek useful action sabse pehle obvious hona chahiye.',
            question: 'Pehle thirty seconds mein user kya try kare?',
            move: 'Ek promise aur ek button chuniye. Baaki sab temporarily hide kijiye.',
        },
        decision: {
            reflection: 'Ek aur opinion se zyada ek real-world signal help karega.',
            question: 'Kaunsa signal ek option ko clearly better bana dega?',
            move: 'Signal ka naam likhiye, phir aaj uska sabse chhota test run kijiye.',
        },
        reset: {
            reflection: 'Ek se zyada thread open hain. Jo aaj ko easier banata hai, usse start kijiye.',
            question: 'Kaunsa thread pehle matter karta hai?',
            move: 'Us ek ko chuniye aur ten minutes ke liye smallest visible step kijiye.',
        },
        artifact: {
            reflection: 'Ye kisi usable cheez mein badalna chahta hai.',
            question: 'Rough hone ke baad bhi kaunsa output useful rahega?',
            move: 'Title, teen bullets, aur ek ask ke saath smallest usable version draft kijiye.',
        },
        start_help: {
            reflection: 'Ek cheez se start kijiye. Banana, decide karna, fix karna, ya samajhna.',
            question: '',
            move: 'Make, Decide, Fix, ya Understand chuniye. Ya ek messy sentence type kijiye.',
        },
        general: {
            reflection: 'Ye abhi wide hai. Isse itna chhota kijiye ki aaj move ho sake.',
            question: 'Iska smallest testable version kya hai?',
            move: 'Testable version ek sentence mein likhiye, phir ek person ko dikhaiye.',
        },
    },
    bn: {
        needs_detail: {
            reflection: 'একটি দিক বলুন, আমি সেখান থেকেই শুরু করব।',
            question: 'কিছু বানাতে, সিদ্ধান্ত নিতে, ঠিক করতে, নাকি বুঝতে চান?',
            move: 'একটি বেছে নিয়ে বিষয়টি নিয়ে আর একটি স্পষ্ট বাক্য লিখুন।',
        },
        general: {
            reflection: 'বিষয়টি এখনো বড়। আজ এগোনোর মতো ছোট করি।',
            question: 'আজ পরীক্ষা করা যায় এমন সবচেয়ে ছোট রূপটি কী?',
            move: 'এক বাক্যে লিখে একজনকে দেখান।',
        },
    },
    ta: {
        needs_detail: {
            reflection: 'ஒரு திசையைச் சொல்லுங்கள்; அங்கிருந்தே தொடங்குகிறேன்.',
            question: 'உருவாக்க வேண்டுமா, முடிவு எடுக்க வேண்டுமா, சரி செய்ய வேண்டுமா, புரிந்துகொள்ள வேண்டுமா?',
            move: 'ஒன்றைத் தேர்ந்தெடுத்து அதைப் பற்றி ஒரு தெளிவான வாக்கியம் எழுதுங்கள்.',
        },
        general: {
            reflection: 'இது இன்னும் பெரியதாக இருக்கிறது. இன்று நகர்த்தக்கூடிய அளவுக்கு சிறிதாக்குவோம்.',
            question: 'இன்று சோதிக்கக்கூடிய மிகச் சிறிய வடிவம் என்ன?',
            move: 'அதை ஒரு வாக்கியமாக எழுதி ஒருவரிடம் காட்டுங்கள்.',
        },
    },
    te: {
        needs_detail: {
            reflection: 'ఒక దిశ చెప్పండి; అక్కడి నుంచే మొదలుపెడతాను.',
            question: 'ఏదైనా తయారు చేయాలా, నిర్ణయించాలా, సరిచేయాలా, అర్థం చేసుకోవాలా?',
            move: 'ఒకటి ఎంచుకుని దాని గురించి మరో స్పష్టమైన వాక్యం రాయండి.',
        },
        general: {
            reflection: 'ఇది ఇంకా పెద్దదిగా ఉంది. ఈరోజే ముందుకు కదిలేంత చిన్నదిగా చేద్దాం.',
            question: 'ఈరోజు పరీక్షించగల అతి చిన్న రూపం ఏమిటి?',
            move: 'దాన్ని ఒక వాక్యంలో రాసి ఒకరికి చూపండి.',
        },
    },
    mr: {
        needs_detail: {
            reflection: 'एक दिशा सांगा; मी तिथूनच सुरू करतो.',
            question: 'काही बनवायचे, ठरवायचे, दुरुस्त करायचे की समजून घ्यायचे?',
            move: 'एक पर्याय निवडा आणि त्याबद्दल आणखी एक स्पष्ट वाक्य लिहा.',
        },
        general: {
            reflection: 'हे अजून मोठे आहे. आज पुढे नेता येईल इतके लहान करूया.',
            question: 'आज तपासता येईल अशी याची सर्वात छोटी आवृत्ती कोणती?',
            move: 'ती एका वाक्यात लिहा आणि एका व्यक्तीला दाखवा.',
        },
    },
    gu: {
        needs_detail: {
            reflection: 'એક દિશા કહો; હું ત્યાંથી જ શરૂ કરીશ.',
            question: 'કંઈ બનાવવું, નક્કી કરવું, સુધારવું કે સમજવું છે?',
            move: 'એક વિકલ્પ પસંદ કરો અને તેના વિશે એક સ્પષ્ટ વાક્ય લખો.',
        },
        general: {
            reflection: 'આ હજી મોટું છે. આજે આગળ વધી શકાય એટલું નાનું કરીએ.',
            question: 'આજે અજમાવી શકાય એવું તેનું સૌથી નાનું સ્વરૂપ શું છે?',
            move: 'તેને એક વાક્યમાં લખો અને એક વ્યક્તિને બતાવો.',
        },
    },
    kn: {
        needs_detail: {
            reflection: 'ಒಂದು ದಿಕ್ಕು ಹೇಳಿ; ಅಲ್ಲಿಂದಲೇ ಆರಂಭಿಸುತ್ತೇನೆ.',
            question: 'ಏನನ್ನಾದರೂ ಮಾಡಬೇಕೇ, ತೀರ್ಮಾನಿಸಬೇಕೇ, ಸರಿಪಡಿಸಬೇಕೇ, ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬೇಕೇ?',
            move: 'ಒಂದನ್ನು ಆಯ್ಕೆ ಮಾಡಿ ಅದರ ಬಗ್ಗೆ ಇನ್ನೊಂದು ಸ್ಪಷ್ಟ ವಾಕ್ಯ ಬರೆಯಿರಿ.',
        },
        general: {
            reflection: 'ಇದು ಇನ್ನೂ ದೊಡ್ಡದಾಗಿದೆ. ಇಂದು ಮುಂದಕ್ಕೆ ಕೊಂಡೊಯ್ಯುವಷ್ಟು ಚಿಕ್ಕದಾಗಿಸೋಣ.',
            question: 'ಇಂದು ಪರೀಕ್ಷಿಸಬಹುದಾದ ಅತಿ ಚಿಕ್ಕ ರೂಪ ಯಾವುದು?',
            move: 'ಅದನ್ನು ಒಂದು ವಾಕ್ಯದಲ್ಲಿ ಬರೆದು ಒಬ್ಬರಿಗೆ ತೋರಿಸಿ.',
        },
    },
    ml: {
        needs_detail: {
            reflection: 'ഒരു ദിശ പറയൂ; അവിടെ നിന്നുതന്നെ തുടങ്ങാം.',
            question: 'എന്തെങ്കിലും ഉണ്ടാക്കണോ, തീരുമാനിക്കണോ, ശരിയാക്കണോ, മനസ്സിലാക്കണോ?',
            move: 'ഒന്ന് തിരഞ്ഞെടുത്ത് അതിനെക്കുറിച്ച് വ്യക്തമായ ഒരു വാക്യം കൂടി എഴുതൂ.',
        },
        general: {
            reflection: 'ഇത് ഇപ്പോഴും വലുതാണ്. ഇന്ന് മുന്നോട്ട് കൊണ്ടുപോകാവുന്നത്ര ചെറുതാക്കാം.',
            question: 'ഇന്ന് പരീക്ഷിക്കാവുന്ന ഏറ്റവും ചെറിയ രൂപം എന്താണ്?',
            move: 'അത് ഒരു വാക്യത്തിൽ എഴുതി ഒരാൾക്ക് കാണിക്കൂ.',
        },
    },
    pa: {
        needs_detail: {
            reflection: 'ਇੱਕ ਦਿਸ਼ਾ ਦੱਸੋ; ਮੈਂ ਉੱਥੋਂ ਹੀ ਸ਼ੁਰੂ ਕਰਾਂਗਾ।',
            question: 'ਕੁਝ ਬਣਾਉਣਾ, ਫ਼ੈਸਲਾ ਕਰਨਾ, ਠੀਕ ਕਰਨਾ ਜਾਂ ਸਮਝਣਾ ਹੈ?',
            move: 'ਇੱਕ ਚੁਣੋ ਅਤੇ ਉਸ ਬਾਰੇ ਇੱਕ ਹੋਰ ਸਾਫ਼ ਵਾਕ ਲਿਖੋ।',
        },
        general: {
            reflection: 'ਇਹ ਹਾਲੇ ਵੱਡਾ ਹੈ। ਇਸਨੂੰ ਅੱਜ ਅੱਗੇ ਵਧ ਸਕਣ ਜਿੰਨਾ ਛੋਟਾ ਕਰੀਏ।',
            question: 'ਅੱਜ ਅਜ਼ਮਾਇਆ ਜਾ ਸਕਣ ਵਾਲਾ ਸਭ ਤੋਂ ਛੋਟਾ ਰੂਪ ਕੀ ਹੈ?',
            move: 'ਇਸਨੂੰ ਇੱਕ ਵਾਕ ਵਿੱਚ ਲਿਖੋ ਅਤੇ ਇੱਕ ਵਿਅਕਤੀ ਨੂੰ ਦਿਖਾਓ।',
        },
    },
    or: {
        needs_detail: {
            reflection: 'ଗୋଟିଏ ଦିଗ କୁହନ୍ତୁ; ମୁଁ ସେଠାରୁ ଆରମ୍ଭ କରିବି।',
            question: 'କିଛି ତିଆରି, ନିଷ୍ପତ୍ତି, ଠିକ୍ କିମ୍ବା ବୁଝିବାକୁ ଚାହୁଁଛନ୍ତି?',
            move: 'ଗୋଟିଏ ବାଛନ୍ତୁ ଏବଂ ଏହା ବିଷୟରେ ଆଉ ଗୋଟିଏ ସ୍ପଷ୍ଟ ବାକ୍ୟ ଲେଖନ୍ତୁ।',
        },
        general: {
            reflection: 'ଏହା ଏବେ ମଧ୍ୟ ବଡ଼। ଆଜି ଆଗକୁ ବଢ଼ିପାରିବା ପରି ଛୋଟ କରିବା।',
            question: 'ଆଜି ପରୀକ୍ଷା କରିହେବା ସବୁଠାରୁ ଛୋଟ ରୂପ କଣ?',
            move: 'ତାହାକୁ ଗୋଟିଏ ବାକ୍ୟରେ ଲେଖି ଜଣେ ବ୍ୟକ୍ତିଙ୍କୁ ଦେଖାନ୍ତୁ।',
        },
    },
    ur: {
        needs_detail: {
            reflection: 'ایک سمت بتائیں؛ میں وہیں سے شروع کروں گا۔',
            question: 'کچھ بنانا، فیصلہ کرنا، ٹھیک کرنا یا سمجھنا ہے؟',
            move: 'ایک انتخاب کریں اور اس کے بارے میں ایک واضح جملہ لکھیں۔',
        },
        general: {
            reflection: 'یہ ابھی بڑا ہے۔ اسے اتنا چھوٹا کرتے ہیں کہ آج آگے بڑھ سکے۔',
            question: 'آج آزمانے کے قابل اس کی سب سے چھوٹی شکل کیا ہے؟',
            move: 'اسے ایک جملے میں لکھیں اور ایک شخص کو دکھائیں۔',
        },
    },
    es: {
        needs_detail: {
            reflection: 'Dame una direccion y puedo empezar.',
            question: 'Quieres hacer, decidir, arreglar o entender algo?',
            move: 'Elige una opcion y agrega una frase concreta.',
        },
        general: {
            reflection: 'Esto todavia es amplio. Hazlo lo bastante pequeno para moverlo hoy.',
            question: 'Cual es la version mas pequena que puedes probar hoy?',
            move: 'Escribe la version probada en una frase y muestrala a una persona.',
        },
    },
    fr: {
        needs_detail: {
            reflection: 'Donne-moi une direction et je peux commencer.',
            question: 'Tu veux faire, decider, corriger ou comprendre quelque chose?',
            move: 'Choisis une option, puis ajoute une phrase concrete.',
        },
        general: {
            reflection: 'C est encore large. Reduis-le jusqu a ce que ca puisse avancer aujourd hui.',
            question: 'Quelle est la plus petite version testable aujourd hui?',
            move: 'Ecris la version testable en une phrase, puis montre-la a une personne.',
        },
    },
};

function languageCode(language = {}) {
    return String(language.reply_language || language.code || '').toLowerCase();
}

function mirrorForLanguage(kind, language = {}) {
    const code = languageCode(language);
    return LANGUAGE_MIRRORS[code]?.[kind] || LANGUAGE_MIRRORS[code]?.general || MIRRORS[kind] || MIRRORS.general;
}

function receiptForLanguage(clean, reason, language = {}) {
    const code = languageCode(language);
    if (code === 'hi') {
        return {
            context_used: `Sirf aapka sentence "${clean}" use hua.`,
            context_excluded: 'Private notes, files, identity context, aur memory bahar rahe.',
            memory_decision: 'Kuch save nahi hua jab tak aap choose na karein.',
            route: reason === 'network'
                ? 'Live answer unreachable tha, isliye local fallback use hua.'
                : 'Local fallback.',
        };
    }
    return {
        context_used: `Only your sentence about "${clean}".`,
        context_excluded: 'Private notes, files, identity context, and memory stayed out.',
        memory_decision: 'Nothing saved unless you choose it.',
        route: reason === 'network'
            ? 'Local fallback because the live answer was unreachable.'
            : 'Local fallback.',
    };
}

export function makeOfflineMirrorResult(intent = '', reason = 'network', language = {}) {
    const clean = cleanIntent(intent) || 'this';
    const kind = classify(clean);
    const mirror = mirrorForLanguage(kind, language);

    return {
        ok: true,
        fallback: true,
        mirror: {
            ...mirror,
            receipt: receiptForLanguage(clean, reason, language),
        },
        truth_state: kind === 'source_check'
            ? {
                status: 'needs_checking',
                checked: false,
                label: 'Needs sources before you rely on it.',
                reason: 'The turn asks for current or external facts.',
                signals: ['current_or_external_claim'],
            }
            : {
                status: 'reflective',
                checked: false,
                label: 'Reflective, not checked with sources.',
                reason: 'No current or external factual claim was detected.',
                signals: [],
            },
    };
}
