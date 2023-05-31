const User = require("../modals/user-model");
const session = require("express-session");

const cloudinary = require("../middleware/cloudinary-mid")

/* Upload image*/
const addUserImage = async function(req, res, next) {
  try {
    const loginEmail = req.session.data.email;
    const images = req.files.map((file) => file.filename);

    let img;
    let imgerr = false;
    let notimg = false;
    
    if (req.files && req.files.length > 0) {
      const user = await User.findOne({ email: loginEmail }).lean();

      // Remove old images from updatedUserData.image array
      await User.updateOne(
        { email: loginEmail },
        { $set: { image: [] } }
      );

      for (const file of req.files) {
        const fileType = file.mimetype;
        if (fileType !== 'image/jpeg' && fileType !== 'image/png') {
          imgerr = true;
        } else {
          const result = await cloudinary.uploader.upload(file.path)
          img = result.public_id
          console.log(result);
          await User.updateOne(
            { email: loginEmail },
            { $addToSet: { image: img } }
          );
        }
      }
    } else {
      notimg = true;
    }
    
    const updatedUserData = await User.findOne({ email: loginEmail }).lean();
    
    // Return JSON response with updated data and error flags
    res.json({ image: updatedUserData.image, imgerr, notimg });
  } catch (error) {
    // Handle error case
    console.log(error);
    res.status(404).render("user/404", {
      user: true,
    });
  }
};

/* Add User Details*/
const addUserDetails = async (req, res) => {
  const userEmail = req.session.data.email;
  const { fullname, email, address, city, state, zip } = req.body;

  try {
    if(req.body.fullname != ""){
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $push: {
          details: {
            fullname: fullname,
            email: email,
            address: address,
            city: city,
            state: state,
            zip: zip,
            selected: false,
          }
        }
      },
      { new: true }
    );
    res.json(user);
    }else{
      throw new Error('Please fill out all required fields');
    }
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    res.status(500).json({ message: 'Failed to update user details' });
    console.log(error);
  }
};

module.exports = {
  addUserImage,
  addUserDetails,
};
