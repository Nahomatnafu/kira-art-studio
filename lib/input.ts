// Reject control characters that can smuggle fields into text or email headers.
export const singleLine = (value: string) => !/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(value);
export const multiline = (value: string) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(value);
export const phoneNumber = (value: string) => !value || /^[+0-9(). #xX-]+$/.test(value) && /[0-9]/.test(value);
