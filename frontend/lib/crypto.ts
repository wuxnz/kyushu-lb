import * as CryptoJS from "crypto-js";

var appSecret = CryptoJS.SHA256(btoa(process.env.APP_SECRET!));
// var appSecret2 = CryptoJS.SHA256(btoa(process.env.APP_SECRET_2!));

export const encrypt = (text: string) => {
  return CryptoJS.AES.encrypt(text, appSecret, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    iv: CryptoJS.lib.WordArray.random(16),
  }).toString();
};

export const decrypt = (text: string) => {
  return CryptoJS.AES.decrypt(text, appSecret).toString(CryptoJS.enc.Utf8);
};
