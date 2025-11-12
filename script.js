// AApni NAYI (NEW) API key ko yahaan "" ke beech mein paste karein
const API_KEY = "AIzaSyCG8i_febSjH53bImbITQxFayvG-JzcSRI";

// HTML elements ko select karein
const imageUpload = document.getElementById('image-upload');
const previewImage = document.getElementById('preview-image');
const generateBtn = document.getElementById('generate-btn');
const captionOutput = document.getElementById('caption-output');

let uploadedFile = null;

// Jab image upload ho, toh preview dikhayein
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Generate button par click hone par
generateBtn.addEventListener('click', async () => {
    if (!uploadedFile) {
        alert("Pehle ek image upload karein!");
        return;
    }

    if (API_KEY === "AAPKI_NAYI_API_KEY_YAHAN_DAALEIN") {
        alert("ERROR: Likhahua code ('script.js') mein apni API Key daalein!");
        return;
    }

    // Button ko loading state mein daalein
    generateBtn.disabled = true;
    generateBtn.textContent = "Soch raha hoon...";
    generateBtn.classList.add('loading');
    captionOutput.innerHTML = "<p>Image ko process kar raha hoon...</p>";

    try {
        // Step 1: Image ko Base64 format mein convert karein
        const base64Image = await fileToBase64(uploadedFile);
        
        // ==========================================================
        // YAHAN PAR Galti Thi (FIXED)
        // Maine `https://generativelanguage.googleapis.com...` poora URL daal diya hai
        // ==========================================================
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            // Pehla part: Hamara text prompt
                            { "text": "Is image ko dekho aur iske liye ek short, creative caption (Hindi ya Hinglish mein) banao." },
                            
                            // Doosra part: Hamari image
                            {
                                "inlineData": {
                                    "mimeType": uploadedFile.type, // e.g., "image/jpeg"
                                    "data": base64Image // base64 string
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            // Ab yeh poora error dikhayega, jaise 400 ya 403
            const errorData = await response.json();
            throw new Error(`API call fail ho gayi: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        
        // Step 3: Result ko display karein
        const caption = data.candidates[0].content.parts[0].text;
        captionOutput.innerHTML = `<p>${caption}</p>`;

    } catch (error) {
        console.error(error); // Poora error console mein dikhayein
        captionOutput.innerHTML = `<p style="color: red;">Ek error aa gayi: ${error.message}</p>`;
    } finally {
        // Button ko normal state mein laayein
        generateBtn.disabled = false;
        generateBtn.textContent = "Caption Generate Karein";
        generateBtn.classList.remove('loading');
    }
});

// Helper function: File ko Base64 string mein badalne ke liye
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // "data:image/jpeg;base64," wala hissa hata dein
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
}