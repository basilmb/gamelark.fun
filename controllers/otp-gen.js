const otpGen = require('otp-generator')

const setOtp = ()=>{
const otp = otpGen.generate(5, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });
return otp
}

module.exports={
    setOtp
}