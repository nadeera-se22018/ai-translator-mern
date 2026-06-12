require('dotenv').config();
async function run() {
    const key = process.env.MS_TRANSLATOR_KEY;
    const region = process.env.MS_TRANSLATOR_REGION || 'southeastasia';

    console.log('Using Key:', key);
    console.log('Using Region:', region);
    const fromCode = 'si';
    const toCode = 'en';
    const inputText = 'ආයුබෝවන් ලෝකය';
    const msUrl = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${fromCode}&to=${toCode}`;
    try {
        const response = await fetch(msUrl, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': region,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([{ text: inputText }])
        });
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Error during fetch:', err);
    }
}
run();
