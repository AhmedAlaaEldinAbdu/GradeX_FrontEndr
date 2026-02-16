// ===================== Name =====================
export const ARABIC_NAME_REGEX = /^(?! )[\u0600-\u06FF0-9\-&/\\() ]{2,100}(?<! )$/;
export const ENGLISH_NAME_REGEX = /^(?! )[A-Za-z0-9\-&/\\() ]{2,100}(?<! )$/;
export const GENERAL_NAME_REGEX = /^(?! )[A-Za-z\u0600-\u06FF0-9\-&/\\() ]{2,100}(?<! )$/;

// ===================== Textarea / Description =====================
export const ARABIC_TEXTAREA_REGEX = /^[\u0600-\u06FF0-9\s.,!?:;()\-&/\\'"%]{2,1000}$/;
export const ENGLISH_TEXTAREA_REGEX = /^[A-Za-z0-9\s.,!?:;()\-&/\\'"%]{2,1000}$/;
export const GENERAL_TEXTAREA_REGEX = /^[A-Za-z\u0600-\u06FF0-9\s.,!?:;()\-&/\\'"%]{2,1000}$/;

// ===================== Text =====================
export const ARABIC_TEXT_REGEX = /^(?! )[\u0600-\u06FF0-9\-&/\\() ]{1,1000}(?<! )$/;
export const ENGLISH_TEXT_REGEX = /^(?! )[A-Za-z0-9\-&/\\() ]{1,1000}(?<! )$/;
export const GENERAL_TEXT_REGEX = /^(?! )[A-Za-z\u0600-\u06FF0-9\-&/\\() ]{1,1000}(?<! )$/;

// ===================== Username =====================
// Triple Name (exactly 3 words)
export const ARABIC_USERNAME_TRIPLE_REGEX = /^[\u0600-\u06FF]+ [\u0600-\u06FF]+ [\u0600-\u06FF]+$/;
export const ENGLISH_USERNAME_TRIPLE_REGEX = /^[A-Za-z]+ [A-Za-z]+ [A-Za-z]+$/;
export const GENERAL_USERNAME_TRIPLE_REGEX = /^[A-Za-z\u0600-\u06FF]+ [A-Za-z\u0600-\u06FF]+ [A-Za-z\u0600-\u06FF]+$/;

// Triple Name or more (>=3 words)
export const ARABIC_USERNAME_REGEX = /^(?! )[\u0600-\u06FF]+( [\u0600-\u06FF]+){2,}(?<! )$/;
export const ENGLISH_USERNAME_REGEX = /^(?! )[A-Za-z]+( [A-Za-z]+){2,}(?<! )$/;
export const GENERAL_USERNAME_REGEX = /^(?! )[A-Za-z\u0600-\u06FF]+( [A-Za-z\u0600-\u06FF]+){2,}(?<! )$/;

// ===================== Password =====================
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\s]{8,64}$/;