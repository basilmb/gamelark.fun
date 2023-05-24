const cloudinary = require('cloudinary').v2;

// Configuration 
cloudinary.config({
  cloud_name: "dleiipmgo",
  api_key: "918115919621673",
  api_secret: "eHJHAAY2KD-0PkS7cJmlNELnkP0"
});

module.exports = cloudinary;