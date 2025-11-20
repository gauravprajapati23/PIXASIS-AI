// ==========================================================
// ZAROORI SETTINGS
// ==========================================================

const API_KEY = "AIzaSyCG8i_febSjH53bImbITQxFayvG-JzcSRI";
const MODEL_NAME = "gemini-2.5-flash"; 

// ==========================================================
// HTML Elements
// ==========================================================
const getStartedBtn = document.getElementById('get-started-btn');
const backBtn = document.getElementById('back-btn'); // <-- Naya Back Button
const homeSection = document.getElementById('home-section');
const uploaderSection = document.getElementById('uploader-section');
const imageUpload = document.getElementById('image-upload');
const previewImage = document.getElementById('preview-image');
const generateBtn = document.getElementById('generate-btn');
const fileName = document.getElementById('file-name');
const previewContainer = document.querySelector('.preview');
const resultContainer = document.querySelector('.result');
const captionText = document.getElementById('caption-text');
const promptInput = document.getElementById('prompt-input'); 

// --- MODAL ELEMENTS ---
const infoButton = document.getElementById('info-button');
const infoModal = document.getElementById('info-modal');
const closeModal = document.getElementById('close-modal');

let uploadedFile = null;

// ==========================================================
// NAVIGATION FUNCTIONS (History API Logic)
// ==========================================================

// 1. Function to Show Home
function showHome() {
    uploaderSection.style.display = 'none';
    homeSection.style.display = 'block';
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 2. Function to Show Uploader
function showUploader() {
    homeSection.style.display = 'none';
    uploaderSection.style.display = 'block';
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================
// Event Listeners
// ==========================================================

// 1. "Get Started" Button Click
getStartedBtn.addEventListener('click', () => {
    showUploader();
    // Browser History mein 'uploader' state add karein
    history.pushState({ view: 'uploader' }, "Uploader", "#upload");
});

// 2. Visual "Back" Button Click
backBtn.addEventListener('click', () => {
    // Browser ka back button trigger karein
    history.back();
});

// 3. Browser Back Button Handler (Popstate Event)
window.addEventListener('popstate', (event) => {
    // Agar history state null hai (matlab Home), toh Home dikhayein
    if (event.state && event.state.view === 'uploader') {
        showUploader();
    } else {
        showHome();
    }
});

// 4. Image Upload Logic
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadedFile = file;
        fileName.textContent = file.name; 
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
        
        resultContainer.style.display = 'none';
        captionText.textContent = "Your generated caption will appear here...";
    }
});

// 5. Generate Button (API Call)
generateBtn.addEventListener('click', async () => {
    if (!uploadedFile) {
        alert("Please upload an image first!");
        return;
    }

    if (API_KEY === "AAPKI_NAYI_API_KEY_YAHAN_DAALEIN") {
        alert("ERROR: Please add your API Key to the 'script.js' file!");
        return;
    }

    setLoading(true);
    captionText.textContent = "Generating caption... Please wait.";
    resultContainer.style.display = 'block';

    try {
        const base64Image = await fileToBase64(uploadedFile);
        const userPrompt = promptInput.value;
        const finalPrompt = userPrompt || "Describe this image in a creative and engaging way for social media.";

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            { "text": finalPrompt }, 
                            {
                                "inlineData": {
                                    "mimeType": uploadedFile.type,
                                    "data": base64Image
                                }
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API call failed: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        const caption = data.candidates[0].content.parts[0].text;
        
        captionText.textContent = caption;

    } catch (error) {
        console.error(error);
        captionText.textContent = `An error occurred: \n${error.message}`;
        captionText.style.color = "#ff6b6b";
    } finally {
        setLoading(false);
        captionText.style.color = "";
    }
});

// --- MODAL LISTENERS ---

infoButton.addEventListener('click', () => {
    infoModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
});

infoModal.addEventListener('click', (event) => {
    if (event.target === infoModal) {
        infoModal.style.display = 'none';
    }
});

// ==========================================================
// Helper Functions
// ==========================================================

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    generateBtn.classList.toggle('loading', isLoading);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
}