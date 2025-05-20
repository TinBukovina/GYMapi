const crypto = require("crypto");
const mongoose = require("mongoose");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Osnovni podaci
    username: {
      type: String,
      required: [true, "Korisničko ime je obavezno"],
      unique: true,
      trim: true,
      minlength: [3, "Korisničko ime mora imati najmanje 3 znaka"],
      maxlength: [20, "Korisničko ime može imati najviše 20 znakova"],
    },
    email: {
      type: String,
      required: [true, "Email je obavezan"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Unesite valjani email",
      ],
    },
    password: {
      type: String,
      required: [true, "Lozinka je obavezna"],
      minlength: [8, "Lozinka mora imati najmanje 8 znakova"],
      select: false,
    },

    // Osobni podaci
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      virtual: true,
      get() {
        // Omogućuje da se ovo oplje (atribut) ne sprema u bazu, nego se izračunava prilikom dohvaćanja dokumenata.
        if (this.firstName && this.lastName) {
          return `${this.firstName} ${this.lastName}`;
        }
        if (this.firstName) {
          return this.firstName;
        }
        return this.username;
      },
    },
    profileImage: {
      type: String,
      default: "default-profile.png",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio može imati najviše 500 znakova"],
    },
    dateOfBirth: {
      type: Date,
    },

    // Kontakt podaci
    phoneNumber: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String,
    },

    // Autentikacija i sigurnost
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: Date,
    passwordChangedAt: Date,

    // Postavke i preferencije
    language: {
      type: String,
      enum: ["hr", "en", "de", "it"],
      default: "hr",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    emailNotifications: {
      newsletter: {
        type: Boolean,
        default: true,
      },
      marketing: {
        type: Boolean,
        default: false,
      },
      accountUpdates: {
        type: Boolean,
        default: true,
      },
    },
    slug: {
      type: String,
    },

    // Metapodaci
    lastLogin: Date,
    lastActive: Date,
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    registrationIP: String,

    // Društvene mreže
    socialProfiles: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },

    // Povezani podaci - reference na druge modele
    /* orders: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
      ], */
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      versionKey: false,
      transform: function (doc, ret) {
        delete ret.id;
        return ret;
      },
    },
  },
);

// DOCUMENT MIDDLEWARE - pokreće se prije (ili poslije, ovisno dali je .pre ili .post metoda) .save i .create (ovisno koji nam je prvi parametar, npr. save ili find), funkcija koja se pokreće prije pozivanja odrežene metode nad User objektom. this pokazuje na dokumnet koji se treba u ovom slučaju spremiti
userSchema.pre("save", async function (next) {
  this.slug = slugify(this.fullName, { lower: true });

  // We will modify password only if the password was modified.
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ isActive: true });
  next();
});

/* userSchema.post("save", function (doc, next) {
  console.log(doc);
  next();
}); */

userSchema.methods.correctPassword = async function (
  candidatPassword,
  userPassword,
) {
  return await bcrypt.compare(candidatPassword, userPassword);
};

userSchema.methods.didUserChangePassword = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changePasswordTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return JWTTimestamp < changePasswordTimestamp;
  }

  return false;
};

userSchema.methods.generatePasswordResetToekn = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, this.resetPasswordToken);
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
