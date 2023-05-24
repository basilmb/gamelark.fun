const User = require("../modals/user-model");
const session = require("express-session");

/* Upload image*/
const addUserImage = async function (req, res, next) {
  try {
    const loginEmail = req.body.email;
    const images = req.files.map((file) => file.filename);
    let imgerr = false;
    let notimg = false;
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const fileType = file.mimetype;
        if (fileType !== 'image/jpeg' && fileType !== 'image/png') {
          imgerr = true;
        } else {
          await User.updateOne(
            { email: loginEmail },
            { $addToSet: { image: file.filename } }
          );
        }
      }
    } else {
      notimg = true;
    }
    const logdata = await User.findOne({ email: loginEmail }).lean();
    res.render("user/profile", { user: true, logdata, imgerr, notimg });
  } catch (error) {
    res.render("user/404", {
      user: true,
    })
    console.log(error);
  }
};

/* Add User Details*/
const addUserDetails = async (req, res) => {
  const userEmail = req.body.hemail;
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
