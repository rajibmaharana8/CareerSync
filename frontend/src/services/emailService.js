import emailjs from '@emailjs/browser';

// Access these via your .env.local or Render Env Vars
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

/**
 * Official EmailJS Browser SDK Wrapper
 * This uses the actual @emailjs/browser library you just installed.
 */
const emailService = {
    /**
     * Send an email directly using your EmailJS account
     * @param {Object} templateParams - Key-value pairs matching your EmailJS template
     */
    send: async (templateParams) => {
        try {
            const result = await emailjs.send(
                SERVICE_ID,
                TEMPLATE_ID,
                templateParams,
                PUBLIC_KEY
            );
            console.log('✅ EmailJS Frontend Success:', result.text);
            return result;
        } catch (error) {
            console.error('❌ EmailJS Frontend Failed:', error);
            throw error;
        }
    },

    /**
     * Initialize EmailJS (call this in your App.jsx or main.js)
     */
    init: () => {
        if (PUBLIC_KEY) {
            emailjs.init(PUBLIC_KEY);
            console.log('🚀 EmailJS Initialized');
        }
    }
};

export default emailService;
